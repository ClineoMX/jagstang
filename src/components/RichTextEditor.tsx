import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Box, HStack, IconButton, useColorModeValue } from '@chakra-ui/react';
import {
  FiBold,
  FiItalic,
  FiList,
  FiCode,
} from 'react-icons/fi';
import { MdFormatListNumbered, MdFormatQuote } from 'react-icons/md';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: string;
}

const MenuBar = ({ editor }: any) => {
  const activeBg = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  if (!editor) {
    return null;
  }

  return (
    <HStack
      spacing={1}
      p={2}
      borderBottom="1px"
      borderColor={useColorModeValue('gray.200', 'gray.600')}
      bg={useColorModeValue('white', 'gray.800')}
      borderTopRadius="md"
      flexWrap="wrap"
    >
      <IconButton
        aria-label="Bold"
        icon={<FiBold />}
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        bg={editor.isActive('bold') ? activeBg : 'transparent'}
        _hover={{ bg: hoverBg }}
      />
      <IconButton
        aria-label="Italic"
        icon={<FiItalic />}
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        bg={editor.isActive('italic') ? activeBg : 'transparent'}
        _hover={{ bg: hoverBg }}
      />
      <IconButton
        aria-label="Bullet List"
        icon={<FiList />}
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        bg={editor.isActive('bulletList') ? activeBg : 'transparent'}
        _hover={{ bg: hoverBg }}
      />
      <IconButton
        aria-label="Ordered List"
        icon={<MdFormatListNumbered />}
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        bg={editor.isActive('orderedList') ? activeBg : 'transparent'}
        _hover={{ bg: hoverBg }}
      />
      <IconButton
        aria-label="Heading 1"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        bg={editor.isActive('heading', { level: 1 }) ? activeBg : 'transparent'}
        _hover={{ bg: hoverBg }}
      >
        H1
      </IconButton>
      <IconButton
        aria-label="Heading 2"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        bg={editor.isActive('heading', { level: 2 }) ? activeBg : 'transparent'}
        _hover={{ bg: hoverBg }}
      >
        H2
      </IconButton>
      <IconButton
        aria-label="Heading 3"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        bg={editor.isActive('heading', { level: 3 }) ? activeBg : 'transparent'}
        _hover={{ bg: hoverBg }}
      >
        H3
      </IconButton>
      <IconButton
        aria-label="Blockquote"
        icon={<MdFormatQuote />}
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        bg={editor.isActive('blockquote') ? activeBg : 'transparent'}
        _hover={{ bg: hoverBg }}
      />
      <IconButton
        aria-label="Code Block"
        icon={<FiCode />}
        size="sm"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        bg={editor.isActive('codeBlock') ? activeBg : 'transparent'}
        _hover={{ bg: hoverBg }}
      />
    </HStack>
  );
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Escribe aquí...',
  readOnly = false,
  minHeight = '200px',
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('white', 'gray.800');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when value prop changes (for initial load)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <Box
      className="rich-text-editor"
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      overflow="hidden"
    >
      {!readOnly && <MenuBar editor={editor} />}
      <Box
        bg={bgColor}
        sx={{
          '.ProseMirror': {
            minHeight,
            padding: '1rem',
            outline: 'none',
            fontSize: 'md',
            fontFamily: 'body',
            '&:focus': {
              outline: 'none',
            },
            'p': {
              marginBottom: '0.5rem',
            },
            'h1': {
              fontSize: '2xl',
              fontWeight: 'bold',
              marginTop: '1rem',
              marginBottom: '0.5rem',
            },
            'h2': {
              fontSize: 'xl',
              fontWeight: 'bold',
              marginTop: '1rem',
              marginBottom: '0.5rem',
            },
            'h3': {
              fontSize: 'lg',
              fontWeight: 'semibold',
              marginTop: '0.75rem',
              marginBottom: '0.5rem',
            },
            'ul, ol': {
              paddingLeft: '1.5rem',
              marginBottom: '0.5rem',
            },
            'li': {
              marginBottom: '0.25rem',
            },
            'blockquote': {
              borderLeft: '3px solid',
              borderColor: 'gray.300',
              paddingLeft: '1rem',
              marginLeft: '0',
              marginBottom: '0.5rem',
              fontStyle: 'italic',
            },
            'code': {
              backgroundColor: 'gray.100',
              padding: '0.125rem 0.25rem',
              borderRadius: '0.25rem',
              fontSize: 'sm',
              fontFamily: 'monospace',
            },
            'pre': {
              backgroundColor: 'gray.100',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              marginBottom: '0.5rem',
              overflow: 'auto',
              '& code': {
                backgroundColor: 'transparent',
                padding: 0,
              },
            },
            'a': {
              color: 'brand.500',
              textDecoration: 'underline',
            },
            'strong': {
              fontWeight: 'bold',
            },
            'em': {
              fontStyle: 'italic',
            },
          },
          '.ProseMirror p.is-editor-empty:first-of-type::before': {
            content: `"${placeholder}"`,
            color: 'gray.400',
            pointerEvents: 'none',
            height: 0,
            float: 'left',
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
};

export default RichTextEditor;
