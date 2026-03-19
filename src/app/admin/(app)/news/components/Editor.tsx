"use client";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onInsertTemplate: () => void;
  onBold: () => void;
  onH2: () => void;
  onUl: () => void;
  onOl: () => void;
  onQuote: () => void;
};

export default function Editor(props: Props) {
  return (
    <div className="md-editor">
      <div className="md-editor__toolbar">
        <button className="btn" type="button" onClick={props.onInsertTemplate}>
          Insert template
        </button>
        <div className="md-editor__tools">
          <button className="btn" type="button" onClick={props.onBold}>
            Bold
          </button>
          <button className="btn" type="button" onClick={props.onH2}>
            H2
          </button>
          <button className="btn" type="button" onClick={props.onUl}>
            Bullet list
          </button>
          <button className="btn" type="button" onClick={props.onOl}>
            Numbered list
          </button>
          <button className="btn" type="button" onClick={props.onQuote}>
            Quote
          </button>
        </div>
      </div>

      <textarea
        className="input md-editor__textarea"
        rows={12}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder="Write like a newspaper article (Markdown)."
      />
    </div>
  );
}
