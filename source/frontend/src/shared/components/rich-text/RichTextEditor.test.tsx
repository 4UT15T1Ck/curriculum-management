import type { Editor } from '@tiptap/react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RichTextEditor } from './RichTextEditor';

describe('RichTextEditor', () => {
  it('shows the initial HTML with its formatting', async () => {
    render(
      <RichTextEditor
        value="<p><strong>đậm</strong> và <em>nghiêng</em></p>"
        aria-label="Mô tả"
      />,
    );
    const box = await screen.findByRole('textbox', { name: 'Mô tả' });
    await waitFor(() =>
      expect(box.querySelector('strong')).toHaveTextContent('đậm'),
    );
    expect(box.querySelector('em')).toHaveTextContent('nghiêng');
  });

  it('reports null, not <p></p>, once the editor is emptied', async () => {
    const onChange = vi.fn();
    let editor: Editor | undefined;
    render(
      <RichTextEditor
        value="<p>x</p>"
        onChange={onChange}
        aria-label="Mô tả"
        onReady={(instance) => (editor = instance)}
      />,
    );
    await waitFor(() => expect(editor).toBeDefined());

    act(() => {
      editor!.commands.clearContent(true);
    });

    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('reports the HTML of what was typed', async () => {
    const onChange = vi.fn();
    let editor: Editor | undefined;
    render(
      <RichTextEditor
        onChange={onChange}
        aria-label="Mô tả"
        onReady={(instance) => (editor = instance)}
      />,
    );
    await waitFor(() => expect(editor).toBeDefined());

    act(() => {
      editor!.commands.insertContent('<ul><li>một</li></ul>');
    });

    expect(onChange).toHaveBeenLastCalledWith(
      expect.stringContaining('<ul><li><p>một</p></li></ul>'),
    );
  });

  it('keeps every tag the server allowlist keeps, table included', async () => {
    let editor: Editor | undefined;
    render(
      <RichTextEditor
        value="<table><tbody><tr><th>Đầu</th></tr><tr><td colspan='1'>ô</td></tr></tbody></table>"
        aria-label="Mô tả"
        onReady={(instance) => (editor = instance)}
      />,
    );
    await waitFor(() => expect(editor).toBeDefined());

    expect(editor!.getHTML()).toMatch(/<table[^>]*>.*<th.*Đầu.*<td.*ô/s);
  });

  it('is not editable when disabled', async () => {
    let editor: Editor | undefined;
    render(
      <RichTextEditor
        value="<p>x</p>"
        disabled
        aria-label="Mô tả"
        onReady={(instance) => (editor = instance)}
      />,
    );
    await waitFor(() => expect(editor).toBeDefined());

    expect(editor!.isEditable).toBe(false);
  });
});
