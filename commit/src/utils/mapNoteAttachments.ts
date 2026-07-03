import type { Attachment, AttachmentType } from '../types';

function inferFileType(mime: string, name: string): AttachmentType {
  const m = mime.toLowerCase();
  const n = name.toLowerCase();
  if (m.startsWith('image/')) return 'image';
  if (m.startsWith('video/')) return 'video';
  if (m.startsWith('audio/')) return 'audio';
  if (m === 'application/pdf' || n.endsWith('.pdf')) return 'pdf';
  if (m.includes('word') || n.endsWith('.doc') || n.endsWith('.docx'))
    return 'word';
  if (m.includes('excel') || n.endsWith('.xls') || n.endsWith('.xlsx'))
    return 'excel';
  if (m.includes('powerpoint') || n.endsWith('.ppt') || n.endsWith('.pptx'))
    return 'powerpoint';
  if (m.includes('dicom') || n.endsWith('.dcm')) return 'dicom';
  if (m.includes('hl7') || n.endsWith('.hl7')) return 'hl7';
  if (m.includes('xml') || n.endsWith('.xml')) return 'xml';
  return 'other';
}

/**
 * Maps API note `attachments` array (snake_case or camelCase) to our Attachment type.
 */
export function mapApiAttachments(
  raw: unknown,
  ctx?: { patientId?: string; noteId?: string }
): Attachment[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const out: Attachment[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    // Notes attachments no longer provide a direct URL. Downloads must go through:
    //   GET /patients/<patient_id>/assets/<asset_id>/
    // so we preserve the asset id and ignore any `url` field.
    const id = String(o.asset_id ?? o.assetId ?? o.id ?? o.uuid ?? '').trim();
    const fileName = String(
      o.fileName ?? o.file_name ?? o.filename ?? 'archivo'
    ).trim();
    const mimeType = String(
      o.mimeType ?? o.mime_type ?? o.content_type ?? 'application/octet-stream'
    );
    const fileSize = Number(o.fileSize ?? o.file_size ?? o.size ?? 0) || 0;
    const uploadedAt = String(
      o.uploadedAt ?? o.uploaded_at ?? o.created_at ?? new Date().toISOString()
    );
    const uploadedBy = String(o.uploadedBy ?? o.uploaded_by ?? '');
    const patientId =
      ctx?.patientId ??
      (o.patientId != null ? String(o.patientId) : undefined);
    const noteId = ctx?.noteId ?? (o.noteId != null ? String(o.noteId) : undefined);
    if (!id && !fileName) continue;
    const rawType = (o.fileType ?? o.file_type) as string | undefined;
    const allowed: AttachmentType[] = [
      'image',
      'video',
      'audio',
      'pdf',
      'word',
      'excel',
      'powerpoint',
      'dicom',
      'hl7',
      'xml',
      'other',
    ];
    const fileType: AttachmentType =
      rawType && (allowed as string[]).includes(rawType)
        ? (rawType as AttachmentType)
        : inferFileType(mimeType, fileName);

    out.push({
      id: id || `asset-${out.length}`,
      fileName: fileName || 'archivo',
      fileSize,
      fileType,
      mimeType: mimeType || 'application/octet-stream',
      url: '',
      uploadedAt,
      uploadedBy,
      patientId,
      noteId,
    });
  }
  return out.length > 0 ? out : undefined;
}
