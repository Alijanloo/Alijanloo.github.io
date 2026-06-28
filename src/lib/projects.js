// Static description of the project documentation sites that live as standalone
// (pandoc-generated) HTML files under /public/projects. They are rendered inside
// an iframe so their self-contained styling is preserved.
export const projects = [
  {
    name: "Retail-Shelf-Monitoring",
    title: "Retail Shelf Monitoring",
    base: "/projects/Retail-Shelf-Monitoring",
    pages: [
      { file: "index.html", title: "Overview" },
      { file: "technical_report.html", title: "Technical Report" },
      { file: "shelf_aligner.html", title: "Shelf Aligner" },
      { file: "dependency_injection.html", title: "Dependency Injection" },
      { file: "project_tree.html", title: "Project Tree" },
    ],
  },
];

export function getProject(name) {
  return projects.find((p) => p.name === name) || null;
}
