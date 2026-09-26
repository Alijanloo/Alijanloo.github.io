import { useMemo } from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import "../styles/timeline.css";
import { timelineData, typeIcons } from "../data/timeline.js";

export default function Timeline() {
  const items = useMemo(() => timelineData, []);

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
            <article className="tl-card">
              {item.subtitle && (
                <p className="tl-subtitle">{item.subtitle}</p>
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
            </article>
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>
    </section>
  );
}
