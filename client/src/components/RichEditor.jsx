import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

export default function RichEditor({ value, onChange, placeholder = '' }) {
  const containerRef = useRef(null);
  const quillRef     = useRef(null);
  const onChangeCb   = useRef(onChange);
  onChangeCb.current = onChange;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || quillRef.current) return;

    quillRef.current = new Quill(el, {
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

    quillRef.current.root.innerHTML = value ?? '';

    quillRef.current.on('text-change', () => {
      onChangeCb.current(quillRef.current.root.innerHTML);
    });

    return () => { quillRef.current = null; };
  }, []);

  const prevValue = useRef(value);
  useEffect(() => {
    if (!quillRef.current) return;
    if (value !== prevValue.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value ?? '';
    }
    prevValue.current = value;
  }, [value]);

  return <div ref={containerRef} style={{ minHeight: '220px', background: '#fff' }} />;
}
