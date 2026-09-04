import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";

import {
  FileFieldsInterceptor,
} from "@nestjs/platform-express";

import { diskStorage } from "multer";

import {
  extname,
} from "node:path";

import {
  randomUUID,
} from "node:crypto";

import type {
  Request,
} from "express";

import {
  AuthService,
} from "./auth.service.js";

import {
  LoginDto,
} from "./dto/login.dto.js";

import {
  RegisterPharmacyDto,
} from "./dto/register-pharmacy.dto.js";

import {
  JwtAuthGuard,
} from "./guards/jwt-auth.guard.js";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
];

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const REGISTER_FILE_FIELDS = [
  {
    name: "businessRegistration",
    maxCount: 1,
  },
  {
    name: "businessLicense",
    maxCount: 1,
  },
  {
    name: "pharmacyLicense",
    maxCount: 1,
  },
  {
    name: "pharmacyPhoto",
    maxCount: 1,
  },
  {
    name: "ownerIdDocument",
    maxCount: 1,
  },
];

type RegisterUploadedFiles = {
  businessRegistration?: Express.Multer.File[];
  businessLicense?: Express.Multer.File[];
  pharmacyLicense?: Express.Multer.File[];
  pharmacyPhoto?: Express.Multer.File[];
  ownerIdDocument?: Express.Multer.File[];
};

function getSafeExtension(
  filename: string,
): string {
  const extension =
    extname(
      filename,
    ).toLowerCase();

  if (
    !ALLOWED_EXTENSIONS.includes(
      extension,
    )
  ) {
    throw new BadRequestException(
      "Only PDF, JPG, JPEG, and PNG files are allowed.",
    );
  }

  return extension;
}

function validateUploadedFile(
  file: Express.Multer.File,
): void {
  if (
    !ALLOWED_MIME_TYPES.includes(
      file.mimetype,
    )
  ) {
    throw new BadRequestException(
      "Only PDF, JPG, JPEG, and PNG files are allowed.",
    );
  }

  getSafeExtension(
    file.originalname,
  );

  if (
    file.size >
    MAX_FILE_SIZE
  ) {
    throw new BadRequestException(
      "Each uploaded file must be 5 MB or smaller.",
    );
  }
}

function getUploadedFilename(
  files: RegisterUploadedFiles,
  field: keyof RegisterUploadedFiles,
): string | undefined {
  return files[field]?.[0]?.filename;
}

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post("register")
  @UseInterceptors(
    FileFieldsInterceptor(
      REGISTER_FILE_FIELDS,
      {
        storage:
          diskStorage({
            destination:
              "./uploads",

            filename: (
              _request,
              file,
              callback,
            ) => {
              try {
                const extension =
                  getSafeExtension(
                    file.originalname,
                  );

                callback(
                  null,
                  `${randomUUID()}${extension}`,
                );
              } catch (
                error
              ) {
                callback(
                  error as Error,
                  "",
                );
              }
            },
          }),

        limits: {
          fileSize:
            MAX_FILE_SIZE,

          files: 5,
        },

        fileFilter: (
          _request,
          file,
          callback,
        ) => {
          if (
            !ALLOWED_MIME_TYPES.includes(
              file.mimetype,
            )
          ) {
            callback(
              new BadRequestException(
                "Only PDF, JPG, JPEG, and PNG files are allowed.",
              ),
              false,
            );

            return;
          }

          try {
            getSafeExtension(
              file.originalname,
            );
          } catch (
            error
          ) {
            callback(
              error as Error,
              false,
            );

            return;
          }

          callback(
            null,
            true,
          );
        },
      },
    ),
  )
  async register(
    @Body()
    registerDto: RegisterPharmacyDto,

    @UploadedFiles()
    uploadedFiles: RegisterUploadedFiles,
  ) {
    const requiredFiles: Array<
      [
        keyof RegisterUploadedFiles,
        string,
      ]
    > = [
      [
        "pharmacyLicense",
        "Pharmacy license document is required.",
      ],
      [
        "ownerIdDocument",
        "Owner ID document is required.",
      ],
    ];

    for (
      const [
        field,
        message,
      ] of requiredFiles
    ) {
      const file =
        uploadedFiles[field]?.[0];

      if (!file) {
        throw new BadRequestException(
          message,
        );
      }

      validateUploadedFile(
        file,
      );
    }

    for (
      const field of Object.keys(
        uploadedFiles,
      ) as Array<
        keyof RegisterUploadedFiles
      >
    ) {
      const file =
        uploadedFiles[field]?.[0];

      if (file) {
        validateUploadedFile(
          file,
        );
      }
    }

    const payload: RegisterPharmacyDto = {
      ...registerDto,

      latitude:
        registerDto.latitude !==
        undefined
          ? Number(
              registerDto.latitude,
            )
          : undefined,

      longitude:
        registerDto.longitude !==
        undefined
          ? Number(
              registerDto.longitude,
            )
          : undefined,

      businessRegistration:
        getUploadedFilename(
          uploadedFiles,
          "businessRegistration",
        ),

      businessLicense:
        getUploadedFilename(
          uploadedFiles,
          "businessLicense",
        ),

      pharmacyLicense:
        getUploadedFilename(
          uploadedFiles,
          "pharmacyLicense",
        ),

      pharmacyPhoto:
        getUploadedFilename(
          uploadedFiles,
          "pharmacyPhoto",
        ),

      ownerIdDocument:
        getUploadedFilename(
          uploadedFiles,
          "ownerIdDocument",
        ),
    };

    return this.authService.registerPharmacy(
      payload,
    );
  }

  @Post("login")
  login(
    @Body()
    loginDto: LoginDto,
  ) {
    return this.authService.login(
      loginDto,
    );
  }

  @Post("upload-document")
  @UseGuards(
    JwtAuthGuard,
  )
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: "file",
          maxCount: 1,
        },
      ],
      {
        storage:
          diskStorage({
            destination:
              "./uploads",

            filename: (
              _request,
              file,
              callback,
            ) => {
              try {
                const extension =
                  getSafeExtension(
                    file.originalname,
                  );

                callback(
                  null,
                  `${randomUUID()}${extension}`,
                );
              } catch (
                error
              ) {
                callback(
                  error as Error,
                  "",
                );
              }
            },
          }),

        limits: {
          fileSize:
            MAX_FILE_SIZE,

          files: 1,
        },

        fileFilter: (
          _request,
          file,
          callback,
        ) => {
          if (
            !ALLOWED_MIME_TYPES.includes(
              file.mimetype,
            )
          ) {
            callback(
              new BadRequestException(
                "Only PDF, JPG, JPEG, and PNG files are allowed.",
              ),
              false,
            );

            return;
          }

          try {
            getSafeExtension(
              file.originalname,
            );
          } catch (
            error
          ) {
            callback(
              error as Error,
              false,
            );

            return;
          }

          callback(
            null,
            true,
          );
        },
      },
    ),
  )
  uploadDocument(
    @UploadedFiles()
    uploadedFiles: {
      file?: Express.Multer.File[];
    },

    @Req()
    request: Request,
  ) {
    const file =
      uploadedFiles?.file?.[0];

    if (!file) {
      throw new BadRequestException(
        "Please select a document or image to upload.",
      );
    }

    const user =
      (
        request as Request & {
          user?: {
            sub: number;
            email: string;
            role:
              | "ADMIN"
              | "PHARMACY_OWNER"
              | "PHARMACY_STAFF";
            pharmacyId:
              | number
              | null;
          };
        }
      ).user;

    if (!user) {
      throw new BadRequestException(
        "Authentication is required.",
      );
    }

    if (
      user.role !==
        "PHARMACY_OWNER" &&
      user.role !==
        "PHARMACY_STAFF"
    ) {
      throw new BadRequestException(
        "Only pharmacy users can upload pharmacy documents.",
      );
    }

    if (
      typeof user.pharmacyId !==
        "number" ||
      user.pharmacyId < 1
    ) {
      throw new BadRequestException(
        "Your account is not connected to a pharmacy.",
      );
    }

    return {
      message:
        "File uploaded successfully.",

      pharmacyId:
        user.pharmacyId,

      file: {
        filename:
          file.filename,

        originalName:
          file.originalname,

        mimeType:
          file.mimetype,

        size:
          file.size,
      },
    };
  }
}