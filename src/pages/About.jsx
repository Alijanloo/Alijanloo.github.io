import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext.jsx";
import Markdown from "../components/Markdown.jsx";
import SEO from "../components/SEO.jsx";

const README_URL =
  "https://raw.githubusercontent.com/Alijanloo/Alijanloo/main/README.md";

const FA_ABOUT = `
  <h1>👋 سلام، من علی جانلو هستم</h1>
  <ul>
    <li>فارغ‌التحصیل رشته علوم کامپیوتر از <strong>دانشگاه فردوسی مشهد</strong></li>
    <li>علاقه‌مند به <strong>پردازش زبان طبیعی (NLP) و یادگیری ماشین</strong></li>
    <li>کارم طراحی راه حل های مبتنی برای هوش مصنوعی برای کسب و کارهاست.</li>
  </ul>
  <hr>
  <h2>کاری که انجام می‌دهم</h2>
  <ul>
    <li>⚙️ <strong>مهندسی یادگیری ماشین</strong> — توسعه چت‌بات‌های Agentic و راه‌حل‌های هوش مصنوعی در <a href="https://parstechai.com/" target="_blank" rel="noopener noreferrer">پارس‌تک</a>.</li>
    <li>📚 <strong>پژوهش</strong> — دنبال کردن تحقیقات علمی در حوزه هوش مصنوعی و یادگیری ماشین.</li>
    <li>🚀 <strong>توسعه هوش مصنوعی و علم داده</strong> — ساخت ابزارهای متن‌باز برای خودکارسازی و تحلیل داده‌ها در اوقات فراغت.</li>
  </ul>
  <hr>
  <h2>🛠️ Tech Stack</h2>
  <div class="badges">
    <img src="https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white" alt="Python">
    <img src="https://img.shields.io/badge/LangChain-%23000000.svg?logo=chainlink&logoColor=white" alt="LangChain">
    <img src="https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white" alt="FastAPI">
    <img src="https://img.shields.io/badge/PyTorch-EE4C2C?logo=pytorch&logoColor=white" alt="PyTorch">
    <img src="https://img.shields.io/badge/%F0%9F%A4%97%20Transformers-FFCC33" alt="Transformers">
    <img src="https://img.shields.io/badge/Elasticsearch-005571?logo=elasticsearch&logoColor=white" alt="Elasticsearch">
    <img src="https://img.shields.io/badge/OpenCV-5C3EE8?logo=opencv&logoColor=white" alt="OpenCV">
    <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white" alt="Docker">
    <img src="https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white" alt="PostgreSQL">
    <img src="https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white" alt="Redis">
    <img src="https://img.shields.io/badge/GitHub%20Actions-2088FF?logo=githubactions&logoColor=white" alt="GitHub Actions">
  </div>
  <hr>
  <h2>📊 GitHub Stats</h2>
  <div class="stats">
    <img src="https://github-readme-stats.vercel.app/api?username=Alijanloo&show_icons=true&theme=tokyonight" alt="Ali's GitHub stats">
    <br>
    <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=Alijanloo&hide=Jupyter%20Notebook&layout=compact&theme=tokyonight" alt="Top Langs">
  </div>
  <hr>
  <h2>🌐 Connect</h2>
  <div class="connect">
    <a href="https://www.linkedin.com/in/ali-janloo/" target="_blank" rel="noopener noreferrer">
      <img src="https://img.shields.io/badge/LinkedIn-0A66C2?logo=linkedin&logoColor=white" alt="LinkedIn">
    </a>
    <a href="mailto:mahmoodjanlooali@gmail.com">
      <img src="https://img.shields.io/badge/Email-D14836?logo=gmail&logoColor=white" alt="Email">
    </a>
  </div>
`;

export default function About() {
  const { lang, t } = useLanguage();
  const [readme, setReadme] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (lang !== "en") return;
    let active = true;
    setStatus("loading");
    fetch(README_URL)
      .then((res) => {
        if (!res.ok) throw new Error("bad response");
        return res.text();
      })
      .then((md) => {
        if (active) {
          setReadme(md);
          setStatus("ok");
        }
      })
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
    };
  }, [lang]);

  return (
    <div className={"about-page" + (lang === "fa" ? " rtl" : "")}>
      <SEO title={t("tabs.about")} />
      {lang === "fa" ? (
        <div dir="rtl" dangerouslySetInnerHTML={{ __html: FA_ABOUT }} />
      ) : (
        <div className="about-readme">
          <h1>About</h1>
          {status === "loading" && <p>Loading GitHub profile…</p>}
          {status === "error" && <p>Failed to load README.</p>}
          {status === "ok" && readme && <Markdown>{readme}</Markdown>}
        </div>
      )}
    </div>
  );
}
