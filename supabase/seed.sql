-- Sample content so the Test Series screen has something to show. Run in the Supabase SQL editor.
with t as (
  insert into public.tests (title, exam, duration_min, is_free, published)
  values ('Physica Sample Mock 1 (Physics)', 'JEE_MAIN', 30, true, true)
  returning id
), q as (
  insert into public.questions (test_id, position, subject, type, body, options)
  select t.id, v.pos, 'PHYSICS', v.type, v.body, v.options::jsonb
  from t, (values
    (1, 'MCQ',       'SI unit of force is:', '["Joule","Newton","Watt","Pascal"]'),
    (2, 'NUMERICAL', 'A body of mass 2 kg accelerates at 5 m/s². Force in N?', '[]'),
    (3, 'MCQ',       'Dimensional formula of work is:', '["MLT^-2","ML^2T^-2","ML^2T^-3","MLT^-1"]')
  ) as v(pos, type, body, options)
  returning id, position
)
insert into public.question_keys (question_id, correct_answer, explanation)
select q.id, k.ans, k.expl
from q join (values
  (1, '1',  'F = ma, so kg·m/s² = Newton.'),
  (2, '10', 'F = ma = 2 × 5 = 10 N.'),
  (3, '1',  'W = F·d = (MLT⁻²)(L) = ML²T⁻².')
) as k(pos, ans, expl) on k.pos = q.position;
