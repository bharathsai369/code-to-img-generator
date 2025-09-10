export const isColorDark = (hexColor: string): boolean => {
  if (!hexColor.startsWith("#")) return true;
  const color = hexColor.substring(1);
  const rgb = parseInt(color, 16);
  const r = (rgb >> 16) & 0xff; 
  const g = (rgb >> 8) & 0xff; 
  const b = (rgb >> 0) & 0xff;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) < 128;
};
