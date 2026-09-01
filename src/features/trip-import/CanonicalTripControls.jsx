import { useState } from "react";
import { Alert, Button, Typography } from "@mui/material";
import { Download, UploadFile } from "@mui/icons-material";
import {
  exportCanonicalJson,
  importCanonicalJson,
} from "../../storage/tripStorage";

export function CanonicalTripControls({ trip, onTripImported }) {
  const [error, setError] = useState("");

  const exportTrip = () => {
    const blob = new Blob([exportCanonicalJson(trip)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${trip.id}.trip-runtime.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importTrip = async (event) => {
    const [file] = event.target.files || [];
    event.target.value = "";
    if (!file) return;
    try {
      const imported = importCanonicalJson(await file.text());
      onTripImported?.(imported);
    } catch {
      setError("這不是有效或支援版本的 Trip Runtime JSON；原本旅程未被取代。");
    }
  };

  return (
    <section className="mt-4 flex flex-col gap-3 border-t border-trip-hairline pt-4">
      <Typography variant="overline">CANONICAL JSON</Typography>
      <Button component="label" variant="outlined" startIcon={<UploadFile />}>
        匯入 Trip JSON
        <input
          hidden
          type="file"
          accept="application/json,.json"
          onChange={importTrip}
        />
      </Button>
      {trip && (
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={exportTrip}
        >
          匯出 Trip JSON
        </Button>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
    </section>
  );
}
