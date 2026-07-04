---
title: "GraphRAG: Enhancing Retrieval-Augmented Generation with Structured Graph-Based Reasoning"
date: 2026-4-25 12:00:00 +0330
categories:
   - NLP
   - Machine Learning
   - Deep Learning
tags: 
   - graph neural networks
   - knowledge graphs
   - graph traversal
   - community detection
author: ali_janloo
cover: assets/graph_rag/GraphRag-Figure1.jpg
pin: false
math: true
---

# **GraphRAG: Enhancing Retrieval-Augmented Generation with Structured Graph-Based Reasoning**

## **Introduction**

Retrieval-Augmented Generation (RAG) has become the standard way to reduce hallucinations in large language models by grounding responses in external knowledge sources. But conventional RAG has a real limitation: it relies on semantic similarity between a query and text chunks, which works fine for retrieving isolated facts but falls apart on queries that require connecting information across a dataset.

This shows up clearly in domains with complex relational structure, like medicine. Ask about a specific symptom, and you'd want its causes, treatments, and related conditions — but that information is usually scattered across multiple documents and linked only implicitly. A similarity search over chunks often can't reconstruct that web of relationships, so retrieval quality degrades even though the answer exists somewhere in the corpus.

RAG also struggles with "sensemaking" queries that require aggregating across the whole dataset, like "What are the top five themes in the data?" There's nothing in that query pointing to a specific chunk, so vector search alone has no good anchor to retrieve from.

GraphRAG addresses this by building a structured knowledge graph from the corpus instead of treating text as isolated chunks. It borrows ideas from network analysis — community detection, graph traversal — to move beyond similarity matching toward relationship-aware reasoning. In short, GraphRAG reframes retrieval as navigating and summarizing a graph, rather than picking independent documents.

This post walks through how GraphRAG builds that graph, how it answers queries with it, and what trade-offs it introduces compared to standard RAG, based on the original [Microsoft Research paper](https://arxiv.org/abs/2404.16130) and its [reference implementation](https://github.com/microsoft/graphrag).

## **Content**

### Indexing

#### Text Chunks

Selecting the chunk size is a fundamental design decision: longer chunks require fewer LLM calls for extraction (which reduces cost), but suffer from degraded recall of information that appears early in the chunk.

#### Text Chunks → Entities & Relationships

This is done using a multipart LLM prompt that first identifies all entities in the text—including their name, type, and description—before identifying all relationships between clearly related entities, including the source and target entities and a description of their relationship. Both kinds of element instances are output as a single list of delimited tuples.

The LLM can also be prompted to extract claims about detected entities. Claims are important factual statements about entities, such as dates, events, and interactions with other entities.

![Prompt structure for extracting entities, relationships, and claims from a text chunk](assets/graph_rag/image-1.png)

To illustrate, suppose a chunk contained the following text:

> NeoChip's (NC) shares surged in their first week of trading on the NewTech Exchange. However, market analysts caution that the chipmaker's public debut may not reflect trends for other technology IPOs. NeoChip, previously a private entity, was acquired by Quantum Systems in 2016. The innovative semiconductor firm specializes in low-power processors for wearables and IoT devices.

The LLM is prompted such that it extracts the following:

**Entities:**
- NeoChip, with description "NeoChip is a publicly traded company specializing in low-power processors for wearables and IoT devices."
- Quantum Systems, with description "Quantum Systems is a firm that previously owned NeoChip."

**Relationships:**
- NeoChip → Quantum Systems: "Quantum Systems owned NeoChip from 2016 until NeoChip became publicly traded."

**Claims:**
- NeoChip's shares surged during their first week of trading on the NewTech Exchange.
- NeoChip debuted as a publicly listed company on the NewTech Exchange.
- Quantum Systems acquired NeoChip in 2016 and held ownership until NeoChip went public.

These prompts can be tailored to the domain of the document corpus by choosing domain-appropriate few-shot exemplars for in-context learning.

Self-reflection is a prompt engineering technique where the LLM generates an answer, is then prompted to evaluate its own output for correctness, clarity, or completeness, and finally generates an improved response based on that evaluation. GraphRAG leverages self-reflection during knowledge graph extraction; the paper explores how removing it affects both performance and cost.

![Self-reflection loop applied during entity and relationship extraction](assets/graph_rag/image.png)

#### Entities & Relationships → Knowledge Graph

The extraction process typically produces multiple instances of the same element, since an element is usually detected and extracted more than once across documents.

In the final step of knowledge graph construction, these instances of entities and relationships become individual nodes and edges in the graph. Entity descriptions are aggregated and summarized for each node and edge. Relationships are aggregated into graph edges, where the number of duplicate detections for a given relationship becomes its edge weight. Claims are aggregated in a similar way.

In this manuscript, the authors use exact string matching for entity resolution (the task of reconciling different extracted names for the same entity). Softer matching approaches can be used with minor adjustments to the prompts or code. GraphRAG is generally resilient to duplicate entities regardless, since duplicates tend to end up clustered together during the summarization steps that follow.

#### Knowledge Graph → Graph Communities

- The pipeline uses Leiden community detection hierarchically, recursively detecting sub-communities within each detected community until reaching leaf communities that can no longer be partitioned.

  > Leiden community detection is an iterative graph clustering algorithm that groups nodes by maximizing modularity—meaning it prefers communities where nodes are more densely connected than would be expected by chance (based on node degree). It starts by assigning each node to its own community, then repeatedly moves each node to the neighboring community that gives the highest modularity gain—i.e., where its connections are stronger than expected under a random graph with the same degree distribution. After this local movement phase, Leiden adds a refinement step to ensure each community is internally well-connected (fixing an issue present in Louvain), then aggregates each community into a super-node to form a smaller graph and repeats the process hierarchically until no further improvement is possible. The result is a set of stable, coherent, multi-level communities.

- Implemented using the **graspologic** library.

#### Graph Communities → Community Summaries

GraphRAG generates community summaries by feeding element summaries (for nodes, edges, and related claims) into a community summary template. Summaries from lower-level communities are then used to generate summaries for the higher-level communities that contain them.


### Query

#### Global Search

Given a user query, community summaries at a chosen level can be used to generate a final answer through a multi-stage process. Because the community structure is hierarchical, the same question can be answered using summaries from different levels.

First, the query is answered in parallel using each community summary (map step), and each answer is given a helpfulness score. The most helpful answers are then elaborated on to produce the final answer (reduce step).

![Global search map phase](assets/graph_rag/image-2.png)
*Map phase*

![Global search reduce phase](assets/graph_rag/image-3.png)
*Reduce phase*

The community level can be fixed in advance, or chosen dynamically. In the dynamic case, the LLM first rates how relevant each level-0 community is to the user query, and the search only descends into a community's children if that community's report is deemed relevant.

#### Local Search

Local search is used when looking for specific information about a particular entity. During indexing, in addition to building the graph, GraphRAG also builds a vector store of entity descriptions. At query time, this store is used to retrieve the most relevant entities; their related relationships, text chunks, and community reports are then gathered, prioritized, and filtered to fit within a single context window of a predefined size (with the proportion of each element type configurable) before generating the final answer.

#### DRIFT Search

DRIFT search is a hybrid approach that combines the strengths of both global and local search. It operates in three phases:

##### Phase 1: Primer

- **High-level summaries:** It gathers pre-computed community reports using HyDE (Hypothetical Document Embeddings) to find the reports most relevant to the query.

  > HyDE picks a random community report to use as a structural template, then asks the LLM to generate a hypothetical, fake answer to the user's query that mimics that template's format. This hypothetical answer is then used to retrieve the most relevant community reports.

- **The foundation:** These summaries are fed to the LLM, which is asked to:
  1. Draft a comprehensive but broad initial answer.
  2. Score how well this answer actually addresses the query.
  3. Generate a list of specific follow-up questions to investigate gaps, missing details, or interesting angles surfaced by the broad answer.
- **The starting point:** This becomes the root of a dynamic search tree.

##### Phase 2: Follow-up

This is where the dynamic reasoning happens. The system loops, acting like a researcher digging through archives based on clues:

- **Prioritizing questions:** It ranks the unanswered follow-up questions generated in the previous step to determine which are most promising.
- **Granular search:** For the top-ranked questions, it performs a local search.
- **Branching out:** For each question investigated, the LLM generates an "intermediate answer" grounded in the raw data—and, based on what it just learned, generates even more follow-up questions.

##### Phase 3: Output Hierarchy

Once the system reaches its depth limit, it has accumulated a large, messy web of broad overviews and highly specific details.

- **Gathering the pieces:** It collects every intermediate answer generated along the way, from the broad primer answer down to the most specific answers found at the bottom of the search tree.
- **The final polish:** This entire collection of context is fed back to the LLM one last time, alongside the original prompt, to produce the final answer. The system also preserves the "map" of how it arrived at this answer, in case the interface wants to surface those steps to the user.

DRIFT search is more computationally intensive than either local or global search alone, since it combines both approaches with iterative refinement.

### Graph Analysis Example

Below is a graph analysis of *A Christmas Carol* by Charles Dickens, indexed using this framework:

![Bar chart of the entities with the most relationships in the "A Christmas Carol" knowledge graph](assets/graph_rag/image-4.png)
*Entities with the most relationships. Image by author.*

Unsurprisingly, Scrooge is the book's main character. Ebenezer Scrooge and Scrooge are likely the same entity, but since the Microsoft GraphRAG implementation lacks an entity resolution step, they weren't merged.

This also illustrates why cleaning the data is a vital step for reducing noise: Project Gutenberg shows up with 13 relationships, even though it isn't part of the book's story.

## **Final Notes**

- The paper compares the comprehensiveness and diversity of Global Search across different community levels (C0–C3) against naive RAG (SS) and hierarchical text summarization (TS). The intermediate community levels came out on top: C2 ≈ C3 ≥ C1 > C0 ≈ TS >> SS.
- **What GraphRAG really buys you over hierarchical text summarization is semantic partitioning before summarization.** But it comes at a cost:

  | Approach | Cost | Quality |
  |----------|------|---------|
  | Hierarchical text summarization | Low | Decent |
  | GraphRAG | High (indexing is expensive) | Better global reasoning |

  The paper reports that graph indexing took roughly 281 minutes for about 1M tokens.

- The paper also suggests hybrid approaches that combine embedding-based retrieval with graph-based summaries.
- Microsoft's reference implementation of GraphRAG is not optimized for production use. For instance, the output of the indexing phase is a set of Parquet files and a vector store, all of which are loaded entirely into memory at inference time—which doesn't scale well to large corpora. That said, [this notebook](https://github.com/tomasonjo/blogs/blob/master/msft_graphrag/ms_graphrag_import.ipynb) shows how to import the indexing output into a Neo4j graph database, which is better suited for production use, and [this blog post](https://neo4j.com/blog/developer/microsoft-graphrag-neo4j/?utm_source=chatgpt.com) walks through implementing global and local search on top of Neo4j.

## **References**

- Edge, D., Trinh, H., Cheng, N., Bradley, J., Chao, A., Mody, A., Truitt, S., Metropolitansky, D., Ness, R. O., & Larson, J. (2024). [From Local to Global: A Graph RAG Approach to Query-Focused Summarization](https://arxiv.org/abs/2404.16130). arXiv:2404.16130.
- [Microsoft GraphRAG repository](https://github.com/microsoft/graphrag)
