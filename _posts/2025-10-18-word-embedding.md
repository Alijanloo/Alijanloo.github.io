---
title: "Word Embeddings"
date: 2025-10-18 12:00:00 +0330
categories:
   - NLP
   - Machine Learning
   - Deep Learning
tags: 
   - word embeddings
   - transformers
   - BERT
   - attention mechanism
   - CBOW
   - Skip-Gram
   - contextual embeddings
   - neural networks
   - language models
   - MTEB
   - benchmarking
   - semantic similarity
author: ali_janloo
cover: assets/word_embedding/embedding_concept.png
pin: false
math: true
---

# 🧠 Word Embeddings


## 📌 What Is the Need for Word Embedding in NLP?

1. **Dimensionality Reduction**  
   Reduces sparse one-hot vectors into dense, meaningful representations.

2. **Semantic Similarity**  
   Captures relationships like *king → queen*, *man → woman* in vector space.

3. **Recommendation Systems**  
   Embeddings can represent users and items in shared spaces.

4. **Efficient Training & Transfer Learning**  
   Pretrained embeddings speed up convergence and improve generalization.

## A brief history
![History of Embedding Models](assets/word_embedding/hsitory-of-embedding-models.png)

*A timeline illustration showing the evolution of word embedding models, from early one-hot and count-based representations to modern neural embeddings and contextual models. This progression highlights how NLP has advanced from simple, sparse encodings to rich, dense, and context-aware vector representations that power today's language models.*

---

## ⚙️ CBOW vs Skip-Gram

| Model                              | Description                                                   | Direction        |
| ---------------------------------- | ------------------------------------------------------------- | ---------------- |
| **CBOW (Continuous Bag of Words)** | Predicts the current word based on surrounding context words. | Context → Target |
| **Skip-Gram**                      | Predicts surrounding words based on the current word.         | Target → Context |

**Embedding Matrix:**  
Each model learns an embedding matrix of size `V × N`,  
where `V` = vocabulary size and `N` = embedding dimension.

![CBOW vs Skip-Gram Diagram](assets/word_embedding/cbow-vs-skipgram.png)

---

## 🧩 Third Era: Deep Contextualized Embeddings

### Example Sentences
- “He played the **bass** guitar during the concert.”  
- “The **bass** swam quickly through the water.”

### Word of Interest: **bass**

- In sentence 1 → **Musical instrument**  
  Representation influenced by words like *guitar*, *concert*.

- In sentence 2 → **Type of fish**  
  Representation shaped by words like *swam*, *water*.

> 💡 **Key Concept:**  
> Modern models produce *dynamic embeddings* —  
> a word’s vector depends on its **context** in the sentence.

---

## 🧠 Transformers & Contextual Vectors

### Key Concepts
- **Context Vector** – Represents meaning within sentence-level context.  
- **Positional Embeddings** – Encode word order for sequential meaning.  
- **Cross Attention** – Allows information exchange between sequences.

![Encoder-Decoder Models](assets/word_embedding/encoder-decoder.png)
![Transformer Architecture](assets/word_embedding/transformers-architecture.png)

---

## 🎯 Attention Mechanisms: The Heart of Modern NLP

### Scaled Dot-Product Attention

The core of transformer architectures lies in the **attention mechanism**, which allows models to focus on relevant parts of the input sequence when processing each word.

![Scaled Dot-Product Attention](assets/word_embedding/scaled-dot-product.png)

#### Mathematical Foundation

The attention mechanism computes a weighted average of values based on the similarity between queries and keys:

{% raw %}
$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$
{% endraw %}

Where:
- **Q** (Query): What information we're looking for
- **K** (Key): What information is available  
- **V** (Value): The actual information content
- **d_k**: Dimension of the key vectors (for scaling)

### Multi-Head Attention

Instead of using a single attention function, transformers employ **multiple attention heads** that can focus on different types of relationships simultaneously.

![Multi-Head Attention](assets/word_embedding/multi-head-attention.png)

#### Benefits of Multiple Heads:
- **Parallel Processing**: Each head learns different attention patterns
- **Rich Representations**: Captures various linguistic relationships
- **Robust Learning**: Reduces dependency on single attention mechanisms

### Attention Visualization

Understanding how attention works in practice:

![Attention Visualization](assets/word_embedding/attention-visualization.png)

*In this example, each row and column represents a token in the sentence. The lines show how much the model's attention (at a specific layer and head) is focused from one word to another. For instance, the word "it_" (highlighted) attends strongly to itself and to related words in the context, revealing how the model links pronouns to their referents. The color intensity and thickness of the lines indicate the strength of attention, helping us interpret which words influence each other during processing.*

---

## 🤖 BERT (Bidirectional Encoder Representations from Transformers)

- **BERT Base:**  
  12 layers × 12 heads → 144 distinct attention mechanisms.  
- Enables **deep contextual understanding** of language.

![BERT Layers Illustration](assets/word_embedding/bert-overview.png)

*This diagram illustrates the architecture of BERT for sequence classification tasks. The input tweet is tokenized and embedded, with a special [CLS] token added at the beginning. Each token (including [CLS]) is converted into an embedding vector, which is then processed through multiple layers of BERT. The output corresponding to the [CLS] token is typically used for classification, while the outputs for other tokens can be used for token-level tasks. The arrows represent the self-attention mechanism, allowing each token to attend to every other token in the sequence.*

---

## 📊 Benchmarking

### **[MTEB](https://huggingface.co/spaces/mteb/leaderboard) — Massive Text Embedding Benchmark**

Used to evaluate embedding models across multiple NLP tasks  
(e.g., retrieval, clustering, semantic similarity, classification).

![MTEB Benchmark Chart](assets/word_embedding/mteb_benchmark.png)

*You can also select **Language-Specific** to choose **Persian** and explore the best Persian embedding models for various tasks.*

---

## 📚 References

1. *Efficient Estimation of Word Representations in Vector Space*  
2. *Distributed Representations of Words and Phrases and their Compositionality*  
3. *Attention Is All You Need*  
4. *BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding*  
5. *Recent Advances in Universal Text Embeddings: A Comprehensive Review of Top-Performing Methods on the MTEB Benchmark*  
6. *L19_seq2seq_rnn-transformers__slides*
