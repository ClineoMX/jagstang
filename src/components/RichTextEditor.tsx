import React, { useEffect, useRef } from 'react';
import type { Editor } from '@tiptap/core';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Box,
  Button,
  HStack,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiBold, FiItalic, FiList, FiPaperclip } from 'react-icons/fi';
import { MdFormatListNumbered, MdRedo, MdUndo } from 'react-icons/md';
import { PRESCRIPTION_TEMPLATE_HTML } from '../constants/prescriptionTemplate';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: string;
  /** Adds paperclip control; selected files are passed to the parent (same flow as note attachments). */
  onAttachFiles?: (files: File[]) => void;
}

const MenuBar = ({
  editor,
  onAttachFiles,
}: {
  editor: Editor | null;
  onAttachFiles?: (files: File[]) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeBg = useColorModeValue('paper.200', 'whiteAlpha.200');
  const hoverBg = useColorModeValue('paper.100', 'whiteAlpha.100');
  const barBg = useColorModeValue('paper.50', 'paper.900');
  const borderCol = useColorModeValue('line.light', 'whiteAlpha.200');
  const dividerCol = useColorModeValue('line.strong', 'whiteAlpha.300');
  const iconColor = useColorModeValue('paper.800', 'paper.100');
  const mutedColor = useColorModeValue('paper.600', 'paper.400');

  if (!editor) {
    return null;
  }

  const groupDivider = (
    <Box
      as="span"
      w="1px"
      alignSelf="stretch"
      minH="28px"
      bg={dividerCol}
      mx={1}
      flexShrink={0}
    />
  );

  return (
    <HStack
      spacing={0}
      px={2}
      py={1.5}
      borderBottom="1px solid"
      borderColor={borderCol}
      bg={barBg}
      borderTopRadius="md"
      flexWrap="wrap"
      align="center"
      color={iconColor}
    >
      <IconButton
        aria-label="Deshacer"
        icon={<MdUndo size={18} />}
        size="sm"
        variant="ghost"
        color={iconColor}
        onClick={() => editor.chain().focus().undo().run()}
        isDisabled={!editor.can().undo()}
        _hover={{ bg: hoverBg }}
      />
      <IconButton
        aria-label="Rehacer"
        icon={<MdRedo size={18} />}
        size="sm"
        variant="ghost"
        color={iconColor}
        onClick={() => editor.chain().focus().redo().run()}
        isDisabled={!editor.can().redo()}
        _hover={{ bg: hoverBg }}
      />

      {groupDivider}

      <IconButton
        aria-label="Negrita"
        icon={<FiBold />}
        size="sm"
        variant="ghost"
        color={iconColor}
        onClick={() => editor.chain().focus().toggleBold().run()}
        bg={editor.isActive('bold') ? activeBg : 'transparent'}
        _hover={{ bg: hoverBg }}
      />
      <IconButton
        aria-label="Cursiva"
        icon={<FiItalic />}
        size="sm"
        variant="ghost"
        color={iconColor}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        bg={editor.isActive('italic') ? activeBg : 'transparent'}
        _hover={{ bg: hoverBg }}
      />
      <IconButton
        aria-label="Subrayado"
        icon={
          <Box as="span" fontWeight="700" fontSize="13px" textDecor="underline">
            U
          </Box>
        }
        size="sm"
        variant="ghost"
        color={iconColor}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        bg={editor.isActive('underline') ? activeBg : 'transparent'}
        _hover={{ bg: hoverBg }}
      />

      {groupDivider}

      <Button
        aria-label="Encabezado 2"
        size="sm"
        variant="ghost"
        color={iconColor}
        fontWeight={700}
        fontSize="12px"
        h="32px"
        minW="36px"
        px={2}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        bg={editor.isActive('heading', { level: 2 }) ? activeBg : 'transparent'}
        _hover={{ bg: hoverBg }}
      >
        H2
      </Button>

      {groupDivider}

      <IconButton
        aria-label="Lista con viñetas"
        icon={<FiList />}
        size="sm"
        variant="ghost"
        color={iconColor}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        bg={editor.isActive('bulletList') ? activeBg : 'transparent'}
        _hover={{ bg: hoverBg }}
      />
      <IconButton
        aria-label="Lista numerada"
        icon={<MdFormatListNumbered />}
        size="sm"
        variant="ghost"
        color={iconColor}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        bg={editor.isActive('orderedList') ? activeBg : 'transparent'}
        _hover={{ bg: hoverBg }}
      />

      {groupDivider}

      {onAttachFiles && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.dcm,.hl7,.xml"
            style={{ display: 'none' }}
            onChange={(e) => {
              const list = e.target.files;
              if (list?.length) onAttachFiles(Array.from(list));
              e.target.value = '';
            }}
          />
          <IconButton
            aria-label="Adjuntar archivos"
            icon={<FiPaperclip />}
            size="sm"
            variant="ghost"
            color={iconColor}
            onClick={() => fileInputRef.current?.click()}
            _hover={{ bg: hoverBg }}
          />
        </>
      )}

      <Button
        aria-label="Insertar plantilla de receta"
        size="sm"
        variant="ghost"
        color={mutedColor}
        fontWeight={700}
        fontSize="12px"
        fontFamily="mono"
        letterSpacing="0.06em"
        h="32px"
        px={2}
        onClick={() =>
          editor.chain().focus().insertContent(PRESCRIPTION_TEMPLATE_HTML).run()
        }
        _hover={{ bg: hoverBg, color: iconColor }}
      >
        Rx
      </Button>
    </HStack>
  );
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Escribe aquí...',
  readOnly = false,
  minHeight = '200px',
  onAttachFiles,
}) => {
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const bgColor = useColorModeValue('white', 'paper.800');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false },
        heading: { levels: [1, 2, 3] },
      }),
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

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
      {!readOnly && <MenuBar editor={editor} onAttachFiles={onAttachFiles} />}
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
            p: {
              marginBottom: '0.5rem',
            },
            h1: {
              fontSize: '2xl',
              fontWeight: 'bold',
              marginTop: '1rem',
              marginBottom: '0.5rem',
            },
            h2: {
              fontSize: 'xl',
              fontWeight: 'bold',
              marginTop: '1rem',
              marginBottom: '0.5rem',
            },
            h3: {
              fontSize: 'lg',
              fontWeight: 'semibold',
              marginTop: '0.75rem',
              marginBottom: '0.5rem',
            },
            'ul, ol': {
              paddingLeft: '1.5rem',
              marginBottom: '0.5rem',
            },
            li: {
              marginBottom: '0.25rem',
            },
            hr: {
              borderColor: 'line.light',
              marginY: '1rem',
            },
            blockquote: {
              borderLeft: '3px solid',
              borderColor: 'gray.300',
              paddingLeft: '1rem',
              marginLeft: '0',
              marginBottom: '0.5rem',
              fontStyle: 'italic',
            },
            code: {
              backgroundColor: 'gray.100',
              padding: '0.125rem 0.25rem',
              borderRadius: '0.25rem',
              fontSize: 'sm',
              fontFamily: 'monospace',
            },
            pre: {
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
            a: {
              color: 'brand.500',
              textDecoration: 'underline',
            },
            strong: {
              fontWeight: 'bold',
            },
            em: {
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
