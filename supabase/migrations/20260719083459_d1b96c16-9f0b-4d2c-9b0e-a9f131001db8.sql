
alter view public.booking_slot_load set (security_invoker = on);
revoke execute on function public.handle_new_user() from public, anon, authenticated;
