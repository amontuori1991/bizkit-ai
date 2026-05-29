"use client";

import { SocialCalendarBuilder } from "@/components/dashboard/SocialCalendarBuilder";
import type { BusinessProfile } from "@/lib/business-profile";

type DemoCalendarSectionProps = {
  profile: BusinessProfile;
  enabled: boolean;
  disabledMessage: string;
};

export function DemoCalendarSection({
  profile,
  enabled,
  disabledMessage,
}: DemoCalendarSectionProps) {
  return (
    <SocialCalendarBuilder
      endpoint="/api/ai/demo"
      enabled={enabled}
      disabledMessage={disabledMessage}
      profileReady
      profile={profile}
      allowSave={false}
      title="Mini social calendar demo"
      helper="Genera un mini calendario di 7 giorni per vedere come BizKit AI passa dal singolo output alla pianificazione completa."
      demoMode
    />
  );
}
