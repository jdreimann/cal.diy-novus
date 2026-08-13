"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

import useMeQuery from "@calcom/trpc/react/hooks/useMeQuery";

function PendoIdentifier() {
  const { data: me } = useMeQuery();
  const { data: session } = useSession();
  const lastIdentifiedId = useRef<number | null>(null);

  useEffect(() => {
    if (typeof pendo === "undefined" || !me || !session?.user) return;
    if (lastIdentifiedId.current === me.id) return;
    lastIdentifiedId.current = me.id;

    const identifyOptions: {
      visitor: Record<string, unknown>;
      account?: Record<string, unknown>;
    } = {
      visitor: {
        id: me.id,
        email: me.email,
        full_name: me.name,
        uuid: session.user.uuid,
        username: me.username,
        emailVerified: me.emailVerified,
        role: session.user.role,
        createdDate: me.createdDate,
        completedOnboarding: me.completedOnboarding,
        timeZone: me.timeZone,
        locale: me.locale,
        identityProvider: me.identityProvider,
        twoFactorEnabled: me.twoFactorEnabled,
        trialEndsAt: me.trialEndsAt,
        hideBranding: me.hideBranding,
        weekStart: me.weekStart,
        timeFormat: me.timeFormat,
        organizationId: me.organizationId,
      },
    };

    if (me.organizationId && me.organization && me.organization.id > 0) {
      identifyOptions.account = {
        id: me.organizationId,
        name: me.organization.name,
        slug: me.organization.slug,
        isPlatform: me.organization.isPlatform,
        isOrgAdmin: me.organization.isOrgAdmin,
        hideBranding: me.organization.hideBranding,
        isOrganizationConfigured:
          me.organizationSettings?.isOrganizationConfigured,
        isOrganizationVerified: me.organizationSettings?.isOrganizationVerified,
        isAdminReviewed: me.organizationSettings?.isAdminReviewed,
        isAdminAPIEnabled: me.organizationSettings?.isAdminAPIEnabled,
        lockEventTypeCreationForUsers:
          me.organizationSettings?.lockEventTypeCreationForUsers,
      };
    }

    pendo.identify(identifyOptions);
  }, [me, session]);

  return null;
}

export function PendoInitializer() {
  const { status } = useSession();
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof pendo === "undefined" || initialized.current) return;
    initialized.current = true;
    pendo.initialize({ visitor: { id: "" } });
  }, []);

  if (status === "authenticated") {
    return <PendoIdentifier />;
  }
  return null;
}
