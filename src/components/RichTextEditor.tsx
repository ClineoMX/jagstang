import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Box, useColorModeValue } from '@chakra-ui/react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Escribe aquí...',
  readOnly = false,
  minHeight = '200px',
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('white', 'gray.800');

  const modules = useMemo(
    () => ({
      toolbar: readOnly
        ? false
        : [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ indent: '-1' }, { indent: '+1' }],
            ['link'],
            ['clean'],
          ],
    }),
    [readOnly]
  );

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'indent',
    'link',
  ];

  return (
    <Box
      className="rich-text-editor"
      sx={{
        '.ql-container': {
          minHeight,
          borderColor,
          fontSize: 'md',
          fontFamily: 'body',
        },
        '.ql-editor': {
          minHeight,
          bg: bgColor,
        },
        '.ql-toolbar': {
          borderColor,
          bg: bgColor,
          borderTopRadius: 'md',
        },
        '.ql-container.ql-snow': {
          borderBottomRadius: 'md',
        },
        '.ql-editor.ql-blank::before': {
          color: 'gray.400',
          fontStyle: 'normal',
        },
      }}
    >
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </Box>
  );
};

export default RichTextEditor;
