import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles';

interface PDFNotesProps {
  notes: string | null | undefined;
}

const notesStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },
  title: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  content: {
    fontSize: 10,
    color: colors.textPrimary,
    lineHeight: 1.5,
  },
  emptyMessage: {
    fontSize: 10,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});

/**
 * Strip HTML tags from a string.
 * Converts common HTML elements to plain text equivalents.
 */
function stripHtml(html: string): string {
  return html
    // Replace <br> and </p> with newlines
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    // Replace list items with bullet points
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    // Remove all remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Trim extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Notes section for displaying evaluation notes.
 * Converts HTML content to plain text.
 */
export function PDFNotes({ notes }: PDFNotesProps) {
  if (!notes || !notes.trim()) {
    return null; // Don't render section if no notes
  }

  const plainTextNotes = stripHtml(notes);

  if (!plainTextNotes) {
    return null; // Don't render if notes are empty after stripping HTML
  }

  return (
    <View style={notesStyles.container} wrap={false}>
      <Text style={notesStyles.title}>Notes</Text>
      <Text style={notesStyles.content}>{plainTextNotes}</Text>
    </View>
  );
}
