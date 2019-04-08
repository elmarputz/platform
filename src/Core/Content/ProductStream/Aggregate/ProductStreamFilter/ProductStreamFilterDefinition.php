<?php declare(strict_types=1);

namespace Shopware\Core\Content\ProductStream\Aggregate\ProductStreamFilter;

use Shopware\Core\Content\ProductStream\ProductStreamDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Field\AttributesField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\ChildrenAssociationField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\CreatedAtField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\FkField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IdField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IntField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\JsonField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\LongTextField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\ManyToOneAssociationField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\ParentAssociationField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\ParentFkField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\StringField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\UpdatedAtField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;

class ProductStreamFilterDefinition extends EntityDefinition
{
    public static function getEntityName(): string
    {
        return 'product_stream_filter';
    }

    public static function getEntityClass(): string
    {
        return ProductStreamFilterEntity::class;
    }

    public static function getCollectionClass(): string
    {
        return ProductStreamFilterCollection::class;
    }

    public static function getParentDefinitionClass(): ?string
    {
        return ProductStreamDefinition::class;
    }

    protected static function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new IdField('id', 'id'))->setFlags(new PrimaryKey(), new Required()),
            (new FkField('product_stream_id', 'productStreamId', ProductStreamDefinition::class))->setFlags(new Required()),
            new ParentFkField(self::class),

            (new StringField('type', 'type'))->setFlags(new Required()),
            new StringField('field', 'field'),
            new StringField('operator', 'operator'),
            new LongTextField('value', 'value'),
            new JsonField('parameters', 'parameters'),
            new IntField('position', 'position'),
            new CreatedAtField(),
            new UpdatedAtField(),

            new ManyToOneAssociationField('productStream', 'product_stream_id', ProductStreamDefinition::class, 'id', false),
            new ParentAssociationField(self::class, 'id'),
            new ChildrenAssociationField(self::class, 'queries'),
            new AttributesField(),
        ]);
    }
}
