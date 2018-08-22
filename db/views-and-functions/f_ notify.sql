create function f_notify() returns trigger
  language plpgsql
  as $$
begin
  perform pg_notify('changed', '');
  return null;
end;
$$;
