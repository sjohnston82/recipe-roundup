import React, { useState, useRef, useEffect } from "react";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { XIcon, PlusIcon } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  availableTags?: string[];
  placeholder?: string;
  disabled?: boolean;
}

export function TagInput({
  tags,
  onChange,
  availableTags,
  placeholder = "Add tags...",
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input value and exclude already selected tags
  const filteredSuggestions = availableTags
    ? availableTags.filter(
        (tag) =>
          tag.toLowerCase().includes(inputValue.toLowerCase()) &&
          !tags.includes(tag) &&
          inputValue.trim() !== ""
      )
    : [];

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
    }
    setInputValue("");
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.trim().length > 0);
    setSelectedSuggestionIndex(-1);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && filteredSuggestions!.length > 0) {
        addTag(filteredSuggestions![selectedSuggestionIndex]);
      } else if (inputValue.trim()) {
        addTag(inputValue.trim());
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < filteredSuggestions!.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleInputFocus = () => {
    if (inputValue.trim().length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }, 200);
  };

  const handleSuggestionClick = (tag: string) => {
    addTag(tag);
    inputRef.current?.focus();
  };

  // Color schemes for tags (matching RecipeCard style)
  const tagColors = [
    "bg-[#eff6ff] text-[#88a3eb] border-[#88a3eb]/20", // Blue
    "bg-[#f0fdf4] text-[#15803d] border-[#15803d]/20", // Green
    "bg-[#fefce8] text-[#a16206] border-[#a16206]/20", // Yellow
    "bg-[#faf5ff] text-[#7e22ce] border-[#7e22ce]/20", // Purple
    "bg-[#fef2f2] text-[#dc2626] border-[#dc2626]/20", // Red
    "bg-[#f0fdfa] text-[#0d9488] border-[#0d9488]/20", // Teal
  ];

  const getTagColor = (index: number) => {
    return tagColors[index % tagColors.length];
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <Badge
            key={tag}
            variant="outline"
            className={`${getTagColor(
              index
            )} cursor-pointer hover:opacity-80 transition-opacity`}
            onClick={() => !disabled && removeTag(tag)}
          >
            {tag}
            {!disabled && <XIcon className="w-3 h-3 ml-1" />}
          </Badge>
        ))}
      </div>

      {!disabled && (
        <div className="relative">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder={placeholder}
              className="flex-1"
            />
            {inputValue.trim() && (
              <Button
                type="button"
                onClick={() => addTag(inputValue.trim())}
                size="sm"
                className="px-3"
              >
                <PlusIcon className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && filteredSuggestions!.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto"
            >
              {filteredSuggestions!.map((suggestion, index) => (
                <div
                  key={suggestion}
                  className={`px-3 py-2 cursor-pointer text-sm hover:bg-gray-100 ${
                    index === selectedSuggestionIndex ? "bg-gray-100" : ""
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
