import { IsOptional, IsString } from 'class-validator'

export class UpdateBrandingRequest {
  @IsOptional()
  @IsString()
  logoUrl?: string | null

  @IsOptional()
  @IsString()
  faviconUrl?: string | null

  @IsOptional()
  @IsString()
  fontFamily?: string | null

  @IsOptional()
  @IsString()
  colorPrimary?: string | null

  @IsOptional()
  @IsString()
  colorSecondary?: string | null

  @IsOptional()
  @IsString()
  colorAccent?: string | null

  @IsOptional()
  @IsString()
  colorBackground?: string | null

  @IsOptional()
  @IsString()
  colorSurface?: string | null

  @IsOptional()
  @IsString()
  colorText?: string | null

  @IsOptional()
  @IsString()
  colorTextMuted?: string | null

  @IsOptional()
  @IsString()
  welcomeMessage?: string | null

  @IsOptional()
  @IsString()
  appName?: string | null
}
