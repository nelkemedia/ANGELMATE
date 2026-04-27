import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

export default function RichEditor({ value, onChange, placeholder = '' }) {
  const wrapperRef = useRef(null);
  const quillRef   = useRef(null);
  const onChangeCb = useRef(onChange);
  onChangeCb.current = onChange;

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const container = document.createElement('div');
    wrapper.appendChild(container);

    quillRef.current = new Quill(container, {
      theme: 'snow',
      placeholder,
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link'],
          [{ color: [] }, { background: [] }],
          ['clean'],
        ],
      },
    });

    // dangerouslyPasteHTML runs the HTML through Quill's clipboard converter,
    // which properly unwraps unsupported block elements (like the outer <div>
    // in email template bodies) instead of silently dropping all content.
    if (value) {
      quillRef.current.clipboard.dangerouslyPasteHTML(value);
    }

    // Only propagate user-initiated edits; API/silent changes (e.g. our own
    // programmatic updates above) must not cause a state-update feedback loop.
    quillRef.current.on('text-change', (_delta, _old, source) => {
      if (source !== 'user') return;
      onChangeCb.current(quillRef.current.root.innerHTML);
    });

    return () => {
      wrapper.innerHTML = '';
      quillRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const prevValue = useRef(value);
  useEffect(() => {
    if (!quillRef.current) return;
    if (value !== prevValue.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.clipboard.dangerouslyPasteHTML(value ?? '');
    }
    prevValue.current = value;
  }, [value]);

  return <div ref={wrapperRef} style={{ minHeight: '220px', background: '#fff' }} />;
}
