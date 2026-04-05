import { prisma } from "@/lib/db/prisma";
import { addressSchema, type AddressInput } from "@/lib/validators/address";

export async function getAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }]
  });
}

export async function saveAddress(userId: string, input: AddressInput) {
  const payload = addressSchema.parse(input);

  if (payload.isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false }
    });
  }

  if (payload.addressId) {
    return prisma.address.update({
      where: { id: payload.addressId },
      data: {
        label: payload.label,
        type: payload.type,
        fullName: payload.fullName,
        phoneNumber: payload.phoneNumber,
        countryCode: payload.countryCode,
        city: payload.city,
        area: payload.area,
        detailedAddress: payload.detailedAddress,
        notes: payload.notes || null,
        isDefault: payload.isDefault
      }
    });
  }

  return prisma.address.create({
    data: {
      userId,
      label: payload.label,
      type: payload.type,
      fullName: payload.fullName,
      phoneNumber: payload.phoneNumber,
      countryCode: payload.countryCode,
      city: payload.city,
      area: payload.area,
      detailedAddress: payload.detailedAddress,
      notes: payload.notes || null,
      isDefault: payload.isDefault
    }
  });
}

export async function deleteAddress(userId: string, addressId: string) {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId }
  });

  if (!address) {
    return;
  }

  await prisma.address.delete({
    where: { id: addressId }
  });
}
