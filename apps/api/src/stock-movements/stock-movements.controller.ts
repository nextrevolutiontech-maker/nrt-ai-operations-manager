import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { StockMovementsService } from './stock-movements.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { MovementFilterDto } from './dto/movement-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Stock Movements')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Bad Request / Validation Error' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden (RBAC)' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Post()
  @Permissions('manage:inventory')
  @ApiOperation({
    summary: 'Create a stock movement (immutable ledger record)',
  })
  @ApiResponse({
    status: 201,
    description: 'Stock movement recorded successfully',
  })
  create(
    @Body() createMovementDto: CreateMovementDto,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.stockMovementsService.create(
      req.user.companyId,
      req.user.id,
      createMovementDto,
    );
  }

  @Get()
  @Permissions('read:inventory', 'manage:inventory')
  @ApiOperation({ summary: 'View stock movement history' })
  @ApiResponse({ status: 200, description: 'History retrieved successfully' })
  findAll(
    @Query() query: MovementFilterDto,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.stockMovementsService.findAll(req.user.companyId, query);
  }
}
