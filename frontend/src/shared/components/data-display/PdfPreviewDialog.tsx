import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconDownload } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface PdfPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBlob: Blob | null;
  title?: string;
}

export function PdfPreviewDialog({
  isOpen,
  onClose,
  pdfBlob,
  title = "Visualização de Etiquetas",
}: PdfPreviewDialogProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    let url: string | null = null;

    if (pdfBlob && isOpen) {
      url = URL.createObjectURL(pdfBlob);
      const currentUrl = url;
      Promise.resolve().then(() => setPdfUrl(currentUrl));
    } else {
      Promise.resolve().then(() => setPdfUrl(null));
    }

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [pdfBlob, isOpen]);

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.setAttribute("download", `etiquetas-${new Date().getTime()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
          <DialogTitle>{title}</DialogTitle>
          <div className="flex items-center gap-2 pr-8">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <IconDownload className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 bg-muted relative">
          {pdfUrl ? (
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0`}
              className="w-full h-full border-none"
              title="PDF Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Carregando visualização...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

