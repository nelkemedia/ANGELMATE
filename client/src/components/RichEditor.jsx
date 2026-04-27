import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

export default function RichEditor({ value, onChange, placeholder = '' }) {
  const wrapperRef  = useRef(null);
  const quillRef    = useRef(null);
  const onChangeCb  = useRef(onChange);
  onChangeCb.current = onChange;

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Create a fresh inner div so Quill owns it completely.
    // The wrapper stays as React's stable anchor.
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

    quillRef.current.root.innerHTML = value ?? '';

    quillRef.current.on('text-change', () => {
      onChangeCb.current(quillRef.current.root.innerHTML);
    });

    return () => {
      // Clearing innerHTML removes both the toolbar and the container
      // that Quill inserted, preventing orphaned DOM nodes on remount.
      wrapper.innerHTML = '';
      quillRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const prevValue = useRef(value);
  useEffect(() => {
    if (!quillRef.current) return;
    if (value !== prevValue.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value ?? '';
    }
    prevValue.current = value;
  }, [value]);

  return <div ref={wrapperRef} style={{ minHeight: '220px', background: '#fff' }} />;
}
