import { Box, Checkbox, Chip, Divider, LinearProgress, List, ListItemButton, ListItemIcon, ListItemText, Paper, Stack, Typography } from "@mui/material";
import { CheckCircle, WarningAmber } from "@mui/icons-material";
import { useTripTodos } from "./useTripTodos";
import { EventIcon } from "./EventPresentation";
import { useViewerData } from "./viewerContext";

export function ReservationsView() {
  const { canonicalTrip, initialTodos, reservations } = useViewerData();
  const [todos, toggleTodo] = useTripTodos(canonicalTrip.id, initialTodos);
  const completed = todos.filter((todo) => todo.done).length;
  const todoState = Object.fromEntries(todos.map((todo) => [todo.id, todo.done]));
  return (
    <>
      {todos.length > 0 && <><Typography variant="overline" color="secondary">BEFORE YOU GO</Typography><Typography variant="h1" fontSize={{ xs: 38, md: 56 }} mt={1}>Trip checklist</Typography><Paper sx={{ mt: 4, p: { xs: 2, md: 3 }, borderTop: 1, borderBottom: 1, borderColor: "text.primary" }}><Stack direction="row" justifyContent="space-between" alignItems="baseline"><Typography fontWeight={700}>出發前確認</Typography><Typography variant="caption" fontFamily="ui-monospace">{completed} / {todos.length}</Typography></Stack><LinearProgress variant="determinate" value={(completed / todos.length) * 100} color={completed === todos.length ? "success" : "secondary"} sx={{ my: 2, height: 4 }} /><List disablePadding>{todos.map((todo) => <ListItemButton key={todo.id} onClick={() => toggleTodo(todo.id)} dense sx={{ px: 0, borderTop: 1, borderColor: "divider" }}><ListItemIcon sx={{ minWidth: 42 }}><Checkbox edge="start" checked={todo.done} tabIndex={-1} disableRipple inputProps={{ "aria-label": todo.label }} /></ListItemIcon><ListItemText primary={todo.label} primaryTypographyProps={{ sx: { textDecoration: todo.done ? "line-through" : "none", color: todo.done ? "text.secondary" : "text.primary" } }} /></ListItemButton>)}</List></Paper></>}
      {reservations.length > 0 ? <><Typography variant="overline" color="secondary" display="block" mt={6}>RESERVATIONS</Typography><Typography variant="h2" fontSize={30} mt={1}>預約與票券</Typography><Stack mt={3} divider={<Divider />}>{reservations.map((reservation) => { const done = todoState[reservation.todoId]; const status = done ? reservation.completeStatus : reservation.pendingStatus || "Action needed"; return <Stack key={reservation.id} direction="row" spacing={2} py={2.5} alignItems="center"><Typography width={92} fontFamily="ui-monospace" fontSize={11}>{reservation.date}</Typography><EventIcon type={reservation.type} /><Box flex={1}><Typography variant="h3" fontSize={17}>{reservation.title}</Typography></Box><Chip icon={done ? <CheckCircle /> : <WarningAmber />} label={status} color={done ? "success" : "warning"} size="small" /></Stack>; })}</Stack></> : <Typography color="text.secondary">這趟旅行沒有已確認的預約或票券。</Typography>}
    </>
  );
}
