import { Alert, Box, Chip, Stack, Typography } from "@mui/material";
import { selectReviewFindings } from "../../domain/trip/review";

const evidenceLabels = {
  valid_source_evidence: "來源證據有效",
  broken_provider_evidence: "來源引用失效",
  traveler_override: "旅客人工新增",
  not_applicable: "未附來源證據",
};

export function ReviewFindingsSummary({ session, summaryRef }) {
  const findings = selectReviewFindings(session);
  return (
    <Box component="section" aria-labelledby="review-findings-heading">
      <Typography id="review-findings-heading" variant="h2" fontSize={24} mb={1.5}>
        Review findings
      </Typography>
      <Alert
        ref={summaryRef}
        tabIndex={-1}
        severity={findings.blockers.length ? "error" : findings.warnings.length ? "warning" : "success"}
        role="status"
        aria-live="polite"
      >
        {findings.blockers.length
          ? `${findings.blockers.length} 個問題必須先修正；另有 ${findings.warnings.length} 個提醒。`
          : `可產生旅程；仍有 ${findings.warnings.length} 個不阻擋提醒。`}
      </Alert>
      {findings.all.length > 0 && (
        <Stack spacing={1.25} mt={2}>
          {findings.all.map((finding) => (
            <Alert key={finding.id} severity={finding.severity === "blocking" ? "error" : "warning"}>
              <Stack spacing={0.75}>
                <Stack direction="row" gap={0.75} flexWrap="wrap" alignItems="center">
                  <Chip size="small" label={finding.entityLabel} />
                  {finding.parserNoteKind && <Chip size="small" variant="outlined" label={finding.parserNoteKind} />}
                  <Chip size="small" variant="outlined" label={evidenceLabels[finding.evidenceValidity]} />
                </Stack>
                <Typography variant="body2">{finding.message}</Typography>
              </Stack>
            </Alert>
          ))}
        </Stack>
      )}
    </Box>
  );
}
