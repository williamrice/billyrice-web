-- Development defaults only. Public resume selection remains unset until a
-- profile exists, and existing settings are never overwritten.
INSERT INTO "ApplicationSetting" ("key", "value", "createdAt", "updatedAt")
VALUES
  (
    'appearance.devicons',
    '{"enabled":true,"version":"v2.17.0","icons":["typescript","react","nextjs","nodejs","csharp","dotnetcore","php","wordpress","mysql","postgresql","tailwindcss","html5"],"opacity":0.075,"size":72,"motionEnabled":true}'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'features.projects',
    '{"enabled":true}'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("key") DO NOTHING;
