import { IsString, IsNotEmpty } from 'class-validator'

export class CreateCompanyRequest {
  @IsString()
  @IsNotEmpty()
  name!: string
}

export class CreateCompanyResponse {
  id!: string
  name!: string
  slug!: string

  static from(props: { id: string; name: string; slug: string }): CreateCompanyResponse {
    const response = new CreateCompanyResponse()
    response.id = props.id
    response.name = props.name
    response.slug = props.slug
    return response
  }
}
