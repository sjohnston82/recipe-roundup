// Shared tag color schemes used across the application
export const tagColors = [
  "bg-[#eff6ff] text-[#88a3eb] border-[#88a3eb]/20", // Blue
  "bg-[#f0fdf4] text-[#15803d] border-[#15803d]/20", // Green
  "bg-[#fefce8] text-[#a16206] border-[#a16206]/20", // Yellow
  "bg-[#faf5ff] text-[#7e22ce] border-[#7e22ce]/20", // Purple
  "bg-[#fef2f2] text-[#dc2626] border-[#dc2626]/20", // Red
  "bg-[#f0fdfa] text-[#0d9488] border-[#0d9488]/20", // Teal
];

export function getTagColor(index: number): string {
  return tagColors[index % tagColors.length];
}
