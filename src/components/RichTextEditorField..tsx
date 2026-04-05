import React, { useRef, useMemo, useEffect } from "react";
import JoditEditor from "jodit-react";
 
const RichTextEditorField = ({ name, value, onChange, placeholder }) => {
  const editor = useRef(null);
 
  const config = useMemo(
    () => ({
      readonly: false,
      height: 600,
      toolbarSticky: false,
      placeholder: placeholder || "Start typing...",
    }),
    [placeholder]
  );
 
  // Prevent re-render loops by isolating updates
  const handleBlur = (newContent) => {
    if (newContent !== value) {
      onChange(name, newContent);
    }
  };
 
  return (
    <JoditEditor
      ref={editor}
      config={config}
      value={value}
      onBlur={handleBlur}
    />
  );
};
 
export default RichTextEditorField;
 
 