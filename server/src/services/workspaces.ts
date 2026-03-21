import { and, eq } from "drizzle-orm";
import { db } from "../db";
import {
  workspaces,
  workspaceMembers,
  workspaceRole,
} from "../db/schema";
import { slugify } from "../utils/slug";
import { requireWorkspaceRole } from "./rbac";
import { logActivity } from "./activity";

const generateUniqueSlug = async (name: string) => {
  const base = slugify(name);
  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await db.query.workspaces.findFirst({
      where: (table, { eq }) => eq(table.slug, slug),
    });
    if (!existing) return slug;
    counter += 1;
    slug = `${base}-${counter}`;
  }
};

export const listWorkspacesForUser = async (userId: string) => {
  const memberships = await db.query.workspaceMembers.findMany({
    where: (table, { eq }) => eq(table.userId, userId),
    with: {
      workspace: true,
    },
  });
  return memberships.map((membership) => membership.workspace);
};

export const createWorkspace = async (userId: string, name: string, slug?: string) => {
  const workspaceSlug = slug ? slugify(slug) : await generateUniqueSlug(name);

  const [workspace] = await db
    .insert(workspaces)
    .values({
      name,
      slug: workspaceSlug,
      createdByUserId: userId,
    })
    .returning();

  await db.insert(workspaceMembers).values({
    workspaceId: workspace.id,
    userId,
    role: workspaceRole.enumValues[0],
  });

  await logActivity({
    workspaceId: workspace.id,
    actorUserId: userId,
    entityType: "workspace",
    entityId: String(workspace.id),
    action: "created",
    meta: { name: workspace.name },
  });

  return workspace;
};

export const updateWorkspace = async (
  workspaceId: number,
  userId: string,
  data: { name?: string; slug?: string },
) => {
  await requireWorkspaceRole(workspaceId, userId, ["owner", "admin"]);

  const values: { name?: string; slug?: string; updatedAt?: Date } = {
    updatedAt: new Date(),
  };

  if (data.name) values.name = data.name;
  if (data.slug) values.slug = slugify(data.slug);

  const [workspace] = await db
    .update(workspaces)
    .set(values)
    .where(eq(workspaces.id, workspaceId))
    .returning();

  if (workspace) {
    await logActivity({
      workspaceId,
      actorUserId: userId,
      entityType: "workspace",
      entityId: String(workspaceId),
      action: "updated",
      meta: { name: workspace.name, slug: workspace.slug },
    });
  }

  return workspace;
};

export const deleteWorkspace = async (workspaceId: number, userId: string) => {
  await requireWorkspaceRole(workspaceId, userId, ["owner"]);
  await logActivity({
    workspaceId,
    actorUserId: userId,
    entityType: "workspace",
    entityId: String(workspaceId),
    action: "deleted",
  });
  await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
};

export const listMembers = async (workspaceId: number, userId: string) => {
  await requireWorkspaceRole(workspaceId, userId, ["owner", "admin", "member"]);
  return db.query.workspaceMembers.findMany({
    where: (table, { eq }) => eq(table.workspaceId, workspaceId),
  });
};

export const addMember = async (
  workspaceId: number,
  userId: string,
  memberUserId: string,
  role: (typeof workspaceRole.enumValues)[number],
) => {
  await requireWorkspaceRole(workspaceId, userId, ["owner", "admin"]);

  const [member] = await db
    .insert(workspaceMembers)
    .values({
      workspaceId,
      userId: memberUserId,
      role,
    })
    .onConflictDoNothing()
    .returning();

  if (member) {
    await logActivity({
      workspaceId,
      actorUserId: userId,
      entityType: "workspace_member",
      entityId: String(member.id),
      action: "added",
      meta: { memberUserId, role },
    });
  }

  return member;
};

export const updateMemberRole = async (
  workspaceId: number,
  userId: string,
  memberUserId: string,
  role: (typeof workspaceRole.enumValues)[number],
) => {
  await requireWorkspaceRole(workspaceId, userId, ["owner"]);

  const [member] = await db
    .update(workspaceMembers)
    .set({ role })
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, memberUserId),
      ),
    )
    .returning();

  if (member) {
    await logActivity({
      workspaceId,
      actorUserId: userId,
      entityType: "workspace_member",
      entityId: String(member.id),
      action: "role_updated",
      meta: { memberUserId, role },
    });
  }

  return member;
};

export const removeMember = async (
  workspaceId: number,
  userId: string,
  memberUserId: string,
) => {
  await requireWorkspaceRole(workspaceId, userId, ["owner", "admin"]);

  const [member] = await db
    .delete(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, memberUserId),
      ),
    )
    .returning();

  if (member) {
    await logActivity({
      workspaceId,
      actorUserId: userId,
      entityType: "workspace_member",
      entityId: String(member.id),
      action: "removed",
      meta: { memberUserId },
    });
  }

  return member;
};
