# notifications

trigger: triggered by event
workflow:

1. hook will get relevant information
2. hook will get user preference
   1. given key -> does this user want mail/notification
   2. if not false then proceed
3. email or notification gets triggered

## checkUserPreferences

1. given notification key -> lookup group and subgroup
2. with group & subgroup check userdocument: preferences.notification [] => is the group & subgroup setting turned to false?
3. return true/false to hook
