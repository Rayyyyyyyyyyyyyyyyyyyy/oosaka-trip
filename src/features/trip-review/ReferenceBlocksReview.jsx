import { Accordion, AccordionDetails, AccordionSummary, Chip, Stack, Typography } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";

export function sourceBlockContent(block) {
  if (!block) return "";
  if (block.kind === "table") return block.rows.map((row) => row.join(" | ")).join("\n");
  return block.text;
}

export function ReferenceBlocksReview({ references, sourceDocument }) {
  if (!references.length) return null;
  return (
    <Stack component="section" aria-labelledby="preserved-reference-heading" spacing={1}>
      <Typography id="preserved-reference-heading" variant="h2" fontSize={28}>
        保留的支援資訊
      </Typography>
      <Typography variant="body2" color="text.secondary">
        這些區塊保留為背景、操作指引或其他支援資訊，不會因此被加入每日行程。
      </Typography>
      {references.map((reference, index) => {
        const block = sourceDocument.blocks.find((candidate) => candidate.id === reference.blockId);
        return (
          <Accordion key={`${reference.blockId}-${reference.classification}-${index}`} disableGutters>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">
                <Chip size="small" label={reference.classification} />
                <Typography fontWeight={700}>{reference.reason}</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              {block ? (
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    Lines {block.locator.startLine}–{block.locator.endLine} · {reference.blockId}
                  </Typography>
                  <Typography component="pre" variant="body2" sx={{ whiteSpace: "pre-wrap", fontFamily: "inherit", m: 0 }}>
                    {sourceBlockContent(block)}
                  </Typography>
                </Stack>
              ) : (
                <Typography variant="body2" color="warning.main">
                  找不到來源區塊 {reference.blockId}；不會顯示或推測缺少的內容。
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Stack>
  );
}
