import React from 'react';
import { Button } from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import FormulariosEditor from '../../components/FormulariosEditor';

const FormEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const goBack = () => navigate('/library/forms');

  return (
    <PageShell
      crumbs="Biblioteca · Formularios"
      title={isNew ? 'Nuevo formulario' : 'Editar formulario'}
      sub={
        isNew
          ? 'Sube un PDF y posiciona los campos que se completarán al usarlo.'
          : undefined
      }
      actions={
        <Button
          leftIcon={<FiArrowLeft />}
          variant="outline"
          size="sm"
          h="36px"
          onClick={goBack}
          borderColor="line.strong"
          color="ink.700"
          fontWeight={500}
          _hover={{ bg: 'paper.100' }}
        >
          Volver
        </Button>
      }
    >
      <FormulariosEditor
        viewMode="editor"
        editingFormId={isNew ? null : id ?? null}
        onSelectNew={() => navigate('/library/forms/new')}
        onSelectForm={(formId) => navigate(`/library/forms/${formId}`)}
        onBack={goBack}
      />
    </PageShell>
  );
};

export default FormEditor;
