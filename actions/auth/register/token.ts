'use server';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import { makeRandString, maskingEmail, maskingName } from '@/lib/util';
import { sendVerificationEmail } from '@/lib/mail';
import { getUserByEmail, getUserByPhone } from '@/actions/user/info';
import { VerificationPurpose } from '@prisma/client';
import { getDictionary } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';
import { formatMessage } from '@/lib/util';

export const generateVerificationToken = async (
  email: string,
  purpose: VerificationPurpose,
) => {
  const language = await ckLocale();
  const dictionary = await getDictionary(language);

  const token = uuidv4();
  const code = makeRandString(6, 'numeric');
  const expires = dayjs().add(5, 'minute').toDate();

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return {
      success: false,
      message: formatMessage(dictionary.common.form.alreadyUse, {
        column: email,
      }),
    };
  }

  await prisma.verification.create({
    data: {
      identifier: email,
      code,
      type: 'email',
      purpose,
      expiresAt: expires,
    },
  });

  const emailSent = await sendVerificationEmail(email, code, dictionary.common);
  if (emailSent) {
    return {
      success: true,
      message: dictionary.common.form.verification.codeSentSuccessfully,
    };
  } else {
    return {
      success: false,
      message: dictionary.common.form.FailedVerificationEmail,
    };
  }
};

export const generateVerificationUserToken = async (
  email: string,
  purpose: VerificationPurpose,
) => {
  const language = await ckLocale();
  const dictionary = await getDictionary(language);

  const token = uuidv4();
  const code = makeRandString(6, 'numeric');
  const expires = dayjs().add(5, 'minute').toDate();

  const existingUser = await getUserByEmail(email);
  if (!existingUser) {
    return {
      success: false,
      message: formatMessage(dictionary.common.form.notExist, {
        column: email,
      }),
    };
  }

  await prisma.verification.create({
    data: {
      identifier: email,
      code,
      type: 'email',
      purpose,
      expiresAt: expires,
    },
  });

  const emailSent = await sendVerificationEmail(email, code, dictionary);
  if (emailSent) {
    return {
      success: true,
      message: dictionary.common.form.verification.codeSentSuccessfully,
    };
  } else {
    return {
      success: false,
      message: dictionary.common.form.verification.FailedEmail,
    };
  }
};

export const verifyEmailToken = async (
  email: string,
  code: string,
  purpose: VerificationPurpose,
) => {
  const language = await ckLocale();
  const dictionary = await getDictionary(language);

  try {
    const verification = await prisma.verification.findFirst({
      where: {
        identifier: email,
        code,
        purpose,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!verification) {
      return {
        success: false,
        message: dictionary.common.form.verification.invalidCode,
      };
    }

    const isExpired = dayjs().isAfter(dayjs(verification.expiresAt));
    if (isExpired) {
      return {
        success: false,
        message: dictionary.common.form.verification.expiredCode,
      };
    }

    return {
      success: true,
      message: dictionary.common.form.verification.verificationCode,
    };
  } catch (error) {
    console.error('Error verifying code:', error);
    return {
      success: false,
      message: dictionary.common.form.verification.errorVerificationCode,
    };
  }
};

export const generateVerificationPhoneToken = async (
  phone: string,
  purpose: VerificationPurpose,
) => {
  const language = await ckLocale();
  const dictionary = await getDictionary(language);

  const token = uuidv4();
  const code = makeRandString(6, 'numeric');
  const expires = dayjs().add(5, 'minute').toDate();

  const existingUser = await getUserByPhone(phone);
  if (existingUser) {
    return {
      success: false,
      message: formatMessage(dictionary.common.form.alreadyUse, {
        column: phone,
      }),
    };
  }

  await prisma.verification.create({
    data: {
      identifier: phone,
      code,
      type: 'phone',
      purpose,
      expiresAt: expires,
    },
  });

  return {
    success: true,
    message: dictionary.common.form.verification.codeSentSuccessfully,
  };

  // const emailSent = await sendVerificationEmail(phone, code);
  // if (emailSent) {
  //     return { success: true, message: dictionary.common.form.verification.codeSentSuccessfully };
  // } else {
  //     return { success: false, message: dictionary.common.form.FailedVerificationEmail };
  // }
};

export const generateVerificationUserPhoneToken = async (
  phone: string,
  purpose: VerificationPurpose,
) => {
  const language = await ckLocale();
  const dictionary = await getDictionary(language);

  const token = uuidv4();
  const code = makeRandString(6, 'numeric');
  const expires = dayjs().add(5, 'minute').toDate();

  const existingUser = await getUserByPhone(phone);
  if (!existingUser) {
    return {
      success: false,
      message: formatMessage(dictionary.common.form.notExist, {
        column: phone,
      }),
    };
  }

  const email = maskingEmail(existingUser.email);
  const name = maskingName(existingUser.name);
  const user = {
    email: email,
    name: name,
  };

  await prisma.verification.create({
    data: {
      identifier: phone,
      code,
      type: 'phone',
      purpose,
      expiresAt: expires,
    },
  });

  return {
    success: true,
    message: dictionary.common.form.verification.codeSentSuccessfully,
    user: user,
  };

  // const emailSent = await sendVerificationEmail(phone, code);
  // if (emailSent) {
  //     return { success: true, message: dictionary.common.form.verification.codeSentSuccessfully };
  // } else {
  //     return { success: false, message: dictionary.common.form.FailedVerificationEmail };
  // }
};

export const verifyPhoneToken = async (
  phone: string,
  code: string,
  purpose: VerificationPurpose,
) => {
  const language = await ckLocale();
  const dictionary = await getDictionary(language);

  try {
    const verification = await prisma.verification.findFirst({
      where: {
        identifier: phone,
        code,
        purpose,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!verification) {
      return {
        success: false,
        message: dictionary.common.form.verification.invalidCode,
      };
    }

    const isExpired = dayjs().isAfter(dayjs(verification.expiresAt));
    if (isExpired) {
      return {
        success: false,
        message: dictionary.common.form.verification.expiredCode,
      };
    }

    return {
      success: true,
      message: dictionary.common.form.verification.verificationCode,
    };
  } catch (error) {
    console.error('Error verifying code:', error);
    return {
      success: false,
      message: dictionary.common.form.verification.errorVerificationCode,
    };
  }
};
