'use server';
import prisma from '@/lib/prisma';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import { makeRandString, maskingEmail, maskingName } from '@/lib/util';
import { sendVerificationEmail } from '@/lib/mail';
import { getUserByEmail, getUserByPhone } from '@/actions/user/info';
import { VerificationPurpose } from '@prisma/client';
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

export const generateVerificationToken = async (
  email: string,
  purpose: VerificationPurpose,
) => {
  const language = await ckLocale();

  const code = makeRandString(6, 'numeric');
  const expires = dayjs().add(5, 'minute').toDate();

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    const alreadyUseEmail = await __ts(
      'common.form.alreadyUse',
      { column: email },
      language,
    );
    return {
      success: false,
      message: alreadyUseEmail,
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

  const emailSent = await sendVerificationEmail(email, code);
  if (emailSent) {
    const codeSentSuccessfully = await __ts(
      'common.verification.codeSentSuccessfully',
      {},
      language,
    );
    return {
      success: true,
      message: codeSentSuccessfully,
    };
  } else {
    const FailedVerificationEmail = await __ts(
      'common.form.FailedVerificationEmail',
      {},
      language,
    );
    return {
      success: false,
      message: FailedVerificationEmail,
    };
  }
};

export const generateVerificationUserToken = async (
  email: string,
  purpose: VerificationPurpose,
) => {
  const language = await ckLocale();

  const code = makeRandString(6, 'numeric');
  const expires = dayjs().add(5, 'minute').toDate();

  const existingUser = await getUserByEmail(email);
  if (!existingUser) {
    const notExistEmail = await __ts(
      'common.form.notExist',
      { column: email },
      language,
    );
    return {
      success: false,
      message: notExistEmail,
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

  const emailSent = await sendVerificationEmail(email, code);
  if (emailSent) {
    const codeSentSuccessfully = await __ts(
      'common.verification.codeSentSuccessfully',
      {},
      language,
    );
    return {
      success: true,
      message: codeSentSuccessfully,
    };
  } else {
    const FailedEmail = await __ts(
      'common.form.verification.FailedEmail',
      {},
      language,
    );
    return {
      success: false,
      message: FailedEmail,
    };
  }
};

export const verifyEmailToken = async (
  email: string,
  code: string,
  purpose: VerificationPurpose,
) => {
  const language = await ckLocale();

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
      const invalidCode = await __ts(
        'common.form.verification.invalidCode',
        {},
        language,
      );
      return {
        success: false,
        message: invalidCode,
      };
    }

    const isExpired = dayjs().isAfter(dayjs(verification.expiresAt));
    if (isExpired) {
      const expiredCode = await __ts(
        'common.form.verification.expiredCode',
        {},
        language,
      );
      return {
        success: false,
        message: expiredCode,
      };
    }

    const verificationCode = await __ts(
      'common.form.verification.verificationCode',
      {},
      language,
    );

    return {
      success: true,
      message: verificationCode,
    };
  } catch (error) {
    const errorVerificationCode = await __ts(
      'common.form.verification.errorVerificationCode',
      {},
      language,
    );
    console.error('Error verifying code:', error);
    return {
      success: false,
      message: errorVerificationCode,
    };
  }
};

export const generateVerificationPhoneToken = async (
  phone: string,
  purpose: VerificationPurpose,
) => {
  const language = await ckLocale();

  const code = makeRandString(6, 'numeric');
  const expires = dayjs().add(5, 'minute').toDate();

  const existingUser = await getUserByPhone(phone);
  if (existingUser) {
    const alreadyUsePhone = await __ts(
      'common.form.alreadyUse',
      { column: phone },
      language,
    );
    return {
      success: false,
      message: alreadyUsePhone,
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

  const codeSentSuccessfully = await __ts(
    'common.form.verification.codeSentSuccessfully',
    {},
    language,
  );

  return {
    success: true,
    message: codeSentSuccessfully,
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

  const code = makeRandString(6, 'numeric');
  const expires = dayjs().add(5, 'minute').toDate();

  const existingUser = await getUserByPhone(phone);
  if (!existingUser) {
    const notExistPhone = await __ts(
      'common.form.notExist',
      { column: phone },
      language,
    );
    return {
      success: false,
      message: notExistPhone,
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

  const codeSentSuccessfully = await __ts(
    'common.form.verification.codeSentSuccessfully',
    {},
    language,
  );

  return {
    success: true,
    message: codeSentSuccessfully,
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
      const invalidCode = await __ts(
        'common.form.verification.invalidCode',
        {},
        language,
      );

      return {
        success: false,
        message: invalidCode,
      };
    }

    const isExpired = dayjs().isAfter(dayjs(verification.expiresAt));
    if (isExpired) {
      const expiredCode = await __ts(
        'common.form.verification.expiredCode',
        {},
        language,
      );
      return {
        success: false,
        message: expiredCode,
      };
    }

    const verificationCode = await __ts(
      'common.form.verification.verificationCode',
      {},
      language,
    );

    return {
      success: true,
      message: verificationCode,
    };
  } catch (error) {
    const errorVerificationCode = await __ts(
      'common.form.verification.errorVerificationCode',
      {},
      language,
    );

    console.error('Error verifying code:', error);
    return {
      success: false,
      message: errorVerificationCode,
    };
  }
};
