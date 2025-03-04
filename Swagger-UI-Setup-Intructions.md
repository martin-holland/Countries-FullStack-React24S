# Swagger UI Setup Instructions

## 1. Installation

Install the required packages:

```bash
npm install @nestjs/swagger swagger-ui-express
```

## 2. Main Configuration

Update `backend/src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import {
ExpressAdapter,
NestExpressApplication,
} from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';
async function bootstrap() {
const server = express();
const app = await NestFactory.create<NestExpressApplication>(
AppModule,
new ExpressAdapter(server),
);
// ... other configurations ...
// Swagger configuration
const config = new DocumentBuilder()
.setTitle('Countries Fullstack API')
.setDescription('Bridging the gap between frontend and backend')
.setVersion('1.0')
.addTag('countries')
.addBearerAuth()
.build();
// Type assertion to resolve version mismatch
const document = SwaggerModule.createDocument(app as any, config);
SwaggerModule.setup('api', app as any, document);
await app.listen(process.env.PORT ?? 5001);
}
```

Note: The `as any` type assertion is used to resolve version compatibility issues between @nestjs packages.

## 3. Documenting Controllers

Example with `test.controller.ts`:

```typescript
import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
@ApiTags("test") // Groups endpoints under 'test' tag
@Controller("test")
export class TestController {
  @Get("supabase")
  @ApiOperation({ summary: "Get test data" }) // Endpoint description
  @ApiResponse({
    status: 200,
    description: "Returns test data successfully",
  })
  async testConnection() {
    // ... implementation
  }
}
```

This setup ensures that your API documentation is correctly generated and displayed in Swagger UI.

## 4. Documenting DTOs

A DTO (Data Transfer Object) is a plain JavaScript object that defines how the data will be sent over the network. This is useful for documenting the expected input and output formats for your API endpoints.

Example with `test.dto.ts`:

```typescript
import { ApiProperty } from "@nestjs/swagger";
export class TestResponseDto {
  @ApiProperty({
    description: "The message returned",
    example: "Test data",
  })
  message: string;
}
```

This DTO is used in the `test.controller.ts` file to document the expected output format for the `testConnection` endpoint.

By following these steps, you can effectively document your NestJS API using Swagger UI. This setup ensures that your API documentation is both comprehensive and user-friendly, providing valuable information for both developers and users.

## 5. Common Swagger Decorators

- `@ApiTags(tag)`: Groups endpoints
- `@ApiOperation(options)`: Describes endpoint operation
- `@ApiResponse(options)`: Documents response
- `@ApiProperty(options)`: Documents DTO properties
- `@ApiParam(options)`: Documents URL parameters
- `@ApiQuery(options)`: Documents query parameters

Example with multiple decorators:

```typescript
@ApiTags("countries")
@Controller("countries")
export class CountriesController {
  @Get(":id")
  @ApiOperation({ summary: "Get country by ID" })
  @ApiParam({ name: "id", description: "Country ID" })
  @ApiResponse({
    status: 200,
    description: "Country found",
    type: CountryDto,
  })
  @ApiResponse({ status: 404, description: "Country not found" })
  getCountry(@Param("id") id: string) {
    // ... implementation
  }
}
```

This example demonstrates how to use multiple decorators to document an endpoint with detailed information about the request and response parameters.

## 6. Accessing Swagger UI

Access the Swagger UI documentation at:

```
http://localhost:5001/api
```

This URL will display the Swagger UI interface, allowing you to explore and test your API endpoints.

## 7. Additional Configuration Options

### Security Schemes

```typescript
.addBearerAuth() // JWT authentication
.addBasicAuth() // Basic authentication
.addOAuth2() // OAuth2
```

### API Metadata

```typescript
.setTitle('Your API Title')
.setDescription('Your API Description')
.setVersion('1.0')
.setContact('Your Name', 'website', 'email')
.setLicense('MIT', 'https://license-url')
```

### Tags

```typescript
.addTag('countries', 'Country-related endpoints')
.addTag('weather', 'Weather-related endpoints')
```

## 8. Troubleshooting

If you encounter type compatibility issues between @nestjs packages:

1. Use type assertion as shown in main.ts:

```typescript
SwaggerModule.createDocument(app as any, config);
SwaggerModule.setup("api", app as any, document);
```

## 9. Additional Resources

If you want to set up the full typing and descriptions for the test data, you can use the following example:

```typescript
import { ApiProperty } from "@nestjs/swagger";

class TestItem {
  @ApiProperty({
    description: "Unique identifier",
    example: "00e8be51-d20f-4fd7-b128-cd8eabe8f570",
  })
  id: string;

  @ApiProperty({
    description: "Creation timestamp",
    example: "2025-01-10T02:04:25.298293+00:00",
  })
  created_at: string;

  @ApiProperty({
    description: "Item name",
    example: "Test Item 1",
  })
  name: string;

  @ApiProperty({
    description: "Item description",
    example: "This is the first test item",
  })
  description: string;

  @ApiProperty({
    description: "Active status",
    example: true,
  })
  is_active: boolean;
}

export class TestResponseDto {
  @ApiProperty({
    description: "Connection status message",
    example: "Connected to Supabase!",
  })
  status: string;

  @ApiProperty({
    description: "Data returned from Supabase",
    type: [TestItem],
    example: [
      {
        id: "00e8be51-d20f-4fd7-b128-cd8eabe8f570",
        created_at: "2025-01-10T02:04:25.298293+00:00",
        name: "Test Item 1",
        description: "This is the first test item",
        is_active: true,
      },
      {
        id: "374310e9-3baf-4902-9e29-7a37742a4c75",
        created_at: "2025-01-10T02:04:25.298293+00:00",
        name: "Test Item 2",
        description: "This is the second test item",
        is_active: true,
      },
    ],
    required: false,
  })
  data?: TestItem[];

  @ApiProperty({
    description: "Error message if connection fails",
    example: "Failed to connect to database",
    required: false,
  })
  error?: string;

  @ApiProperty({
    description: "Timestamp of the request",
    example: "2025-02-21T00:57:48.098Z",
  })
  timestamp: string;
}
```

This example demonstrates how to set up the full typing and descriptions for the test data.

You will also need to update the `test.controller.ts` file to use the `TestResponseDto` class, with these changes:

```typescript
import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { TestResponseDto } from "../dto/test.dto";
import { SupabaseService } from "../services/supabase.service";

@ApiTags("test")
@Controller("test")
export class TestController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get("supabase")
  @ApiOperation({ summary: "Test Supabase connection" })
  @ApiResponse({
    status: 200,
    description: "Returns test data successfully",
    type: TestResponseDto,
  })
  async testConnection(): Promise<TestResponseDto> {
    try {
      const { data, error } = await this.supabaseService.supabase
        .from("test")
        .select("*")
        .limit(50);

      if (error) throw error;
      return {
        status: "Connected to Supabase!",
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: "Connection failed",
        data: [],
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
```
