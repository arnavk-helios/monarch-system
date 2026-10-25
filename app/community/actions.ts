"use server";

// What happens when you click the buttons on the Community page.

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "../../lib/prisma";
import { requireUser } from "../../lib/session";

// Send a friend request using someone's email address.
export async function sendFriendRequest(formData: FormData) {
  const me = await requireUser();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email.includes("@")) redirect("/community?notice=empty");
  if (email === me.email.toLowerCase()) redirect("/community?notice=self");

  const target = await prisma.user.findUnique({ where: { email } });

  // We give the same answer whether or not the email has an account,
  // so nobody can use this box to find out who has signed up.
  if (!target) redirect("/community?notice=sent");

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: me.id, addresseeId: target.id },
        { requesterId: target.id, addresseeId: me.id },
      ],
    },
  });

  if (existing) {
    // They already asked you? Then sending a request accepts theirs.
    if (existing.status === "PENDING" && existing.addresseeId === me.id) {
      await prisma.friendship.update({
        where: { id: existing.id },
        data: { status: "ACCEPTED" },
      });
      revalidatePath("/community");
      redirect("/community?notice=accepted");
    }
    redirect("/community?notice=exists");
  }

  await prisma.friendship.create({
    data: { requesterId: me.id, addresseeId: target.id },
  });
  revalidatePath("/community");
  redirect("/community?notice=sent");
}

// Say yes to a request someone sent you.
export async function acceptRequest(formData: FormData) {
  const me = await requireUser();
  const friendshipId = String(formData.get("friendshipId"));

  await prisma.friendship.updateMany({
    where: { id: friendshipId, addresseeId: me.id, status: "PENDING" },
    data: { status: "ACCEPTED" },
  });
  revalidatePath("/community");
}

// One button for three jobs: decline a request, cancel one you sent,
// or remove a friend. Either person in the pair is allowed to do it.
export async function removeFriendship(formData: FormData) {
  const me = await requireUser();
  const friendshipId = String(formData.get("friendshipId"));

  await prisma.friendship.deleteMany({
    where: {
      id: friendshipId,
      OR: [{ requesterId: me.id }, { addresseeId: me.id }],
    },
  });
  revalidatePath("/community");
}

// Send a congratulation for a friend's rank-up. One per person per rank-up.
export async function sendCheer(formData: FormData) {
  const me = await requireUser();
  const userAchievementId = String(formData.get("userAchievementId"));

  const target = await prisma.userAchievement.findUnique({
    where: { id: userAchievementId },
    include: { achievement: { select: { slug: true } } },
  });

  // Only rank-ups, never your own, and only from accepted friends.
  if (!target || target.userId === me.id) return;
  if (!target.achievement.slug.startsWith("rank-up-")) return;

  const friendship = await prisma.friendship.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: me.id, addresseeId: target.userId },
        { requesterId: target.userId, addresseeId: me.id },
      ],
    },
  });
  if (!friendship) return;

  await prisma.cheer.createMany({
    data: [{ fromUserId: me.id, userAchievementId }],
    skipDuplicates: true,
  });
  revalidatePath("/community");
}