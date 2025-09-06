import { useEffect } from "react";
import { clearFile } from "../../../../store/slices/fileSlice";

const useFileDownload = (file, dispatch) => {
  useEffect(() => {
    if (file) {
      const blob = new Blob([file.data], { type: file.fileType });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      dispatch(clearFile());
    }
  }, [file, dispatch]);
};

export default useFileDownload;
