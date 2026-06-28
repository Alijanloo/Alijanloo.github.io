import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";

// Heavier / less-frequent routes are code-split so the initial bundle stays
// small (KaTeX + highlight.js only load on the post route).
const Post = lazy(() => import("./pages/Post.jsx"));
const Categories = lazy(() => import("./pages/Categories.jsx"));
const CategoryDetail = lazy(() => import("./pages/CategoryDetail.jsx"));
const Tags = lazy(() => import("./pages/Tags.jsx"));
const TagDetail = lazy(() => import("./pages/TagDetail.jsx"));
const Archives = lazy(() => import("./pages/Archives.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Movies = lazy(() => import("./pages/Movies.jsx"));
const Project = lazy(() => import("./pages/Project.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Layout>
        <Suspense fallback={<div className="route-loading">Loading…</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/posts/:slug" element={<Post />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:name" element={<CategoryDetail />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/tags/:name" element={<TagDetail />} />
            <Route path="/archives" element={<Archives />} />
            <Route path="/about" element={<About />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/projects/:name" element={<Project />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </>
  );
}
