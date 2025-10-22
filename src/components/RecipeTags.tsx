import { useEffect, useRef, useState } from "react";
import { Badge } from "./ui/badge";

export function RecipeTags({
  tags,
  onTagClick,
  getTagColor,
}: {
  tags: string[];
  onTagClick?: (tag: string) => void;
  getTagColor: (index: number) => string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleTags, setVisibleTags] = useState<string[]>([]);
  const [measured, setMeasured] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const tagElements = Array.from(
      containerRef.current.children
    ) as HTMLElement[];

    const firstTop = tagElements[0]?.offsetTop ?? 0;
    const fittingTags = tagElements
      .filter((el) => el.offsetTop === firstTop)
      .map((el) => el.dataset.tag!);

    setVisibleTags(fittingTags);
    setMeasured(true);
  }, [tags]);

  const displayedTags = measured ? visibleTags : tags;

  return (
    <div
      className="rounded-xl p-2 flex flex-wrap justify-center gap-2"
      ref={containerRef}
    >
      {displayedTags.map((tag, index) => (
        <Badge
          key={`${tag}-${index}`}
          data-tag={tag}
          variant="secondary"
          className={`${getTagColor(
            index
          )} cursor-pointer hover:opacity-80 transition-opacity`}
          onClick={(e) => {
            e.stopPropagation();
            onTagClick?.(tag);
          }}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
