import { useEffect, useMemo, useState, useCallback } from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import "../styles/timeline.css";
import { timelineData, typeIcons } from "../data/timeline.js";

export default function Timeline() {
  const items = useMemo(() => timelineData, []);
  const [active, setActive] = useState(null);

  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, close]);

  return (
    <section className="tl-section" aria-label="Career timeline">
      <div className="tl-scroll-cue" aria-hidden="true">
        <span className="tl-cue-arrow">▼</span>
        <span className="tl-cue-label">scroll</span>
      </div>

      <VerticalTimeline
        className="tl-root"
        animate={true}
        layout="2-columns"
        lineColor="transparent"
      >
        {items.map((item, index) => (
          <VerticalTimelineElement
            key={item.title}
            className="tl-element"
            contentStyle={{}}
            contentArrowStyle={{}}
            date={item.year}
            dateClassName="tl-date"
            iconStyle={{}}
            icon={<span className="tl-icon">{typeIcons[item.type] ?? "•"}</span>}
            position={index % 2 === 0 ? "left" : "right"}
          >
            <button
              type="button"
              className="tl-card"
              onClick={() => setActive(item)}
            >
              {item.subtitle && (
                <p className="tl-subtitle">
                  {item.subtitleUrl ? (
                    <a
                      href={item.subtitleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.subtitle}
                    </a>
                  ) : (
                    item.subtitle
                  )}
                </p>
              )}
              <h3 className="tl-title">{item.title}</h3>
              <p className="tl-description">{item.description}</p>
              {item.tags?.length > 0 && (
                <ul className="tl-tags">
                  {item.tags.map((tag) => (
                    <li key={tag} className="tl-tag">
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
              <span className="tl-card-more">Read more →</span>
            </button>
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>

      {active && (
        <div
          className="tl-overlay"
          onClick={(e) => {
            if (e.target.classList.contains("tl-overlay")) close();
          }}
        >
          <div className="tl-modal">
            <button type="button" className="tl-modal-close" onClick={close}>
              ×
            </button>
            <div className="tl-modal-header">
              <span className="tl-modal-type">
                {typeIcons[active.type]} {active.type}
              </span>
              <h2>{active.title}</h2>
              <div className="tl-modal-meta">
                <span>{active.year}</span>
                {active.subtitle && (
                  <>
                    <span className="dot">·</span>
                    {active.subtitleUrl ? (
                      <a
                        href={active.subtitleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {active.subtitle}
                      </a>
                    ) : (
                      <span>{active.subtitle}</span>
                    )}
                  </>
                )}
              </div>
              {active.tags?.length > 0 && (
                <div className="tl-modal-tags">
                  {active.tags.map((tag) => (
                    <span className="tl-tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="tl-modal-body">
              <p className="tl-modal-label">Overview</p>
              <p className="tl-modal-plot">{active.description}</p>
              {active.highlights?.length > 0 && (
                <div>
                  <p className="tl-modal-label">Highlights</p>
                  <ul className="tl-modal-highlights">
                    {active.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
              {active.link && (
                <a
                  className="tl-modal-link"
                  href={active.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View project →
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
