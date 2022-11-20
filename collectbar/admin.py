from typing import Dict, Optional
from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from import_export import resources

from collectbar.models import Goal, Section, SignaturePackage

# Register your models here.


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ['name']


class SectionResource(resources.ModelResource):

    def get_instance(self, instance_loader, row):
        section, _created = Section.objects.get_or_create(name=row['section__name'])
        instance = super().get_instance(instance_loader, row)
        if instance is None:
            return
        instance.section_id = section.id
        return instance

    def init_instance(self, row: Dict):
        section, _created = Section.objects.get_or_create(name=row['section__name'])
        instance = super().init_instance(row)
        if instance is None:
            return
        instance.section_id = section.id
        return instance


class GoalRessource(SectionResource):

    class Meta:
        model = Goal
        fields = ('id', 'section__name', 'date', 'amount')


class PackageRessource(SectionResource):

    class Meta:
        model = SignaturePackage
        fields = ('id', 'section__name', 'date', 'amount')


@admin.register(Goal)
class GoalAdmin(ImportExportModelAdmin):
    resource_classes = [GoalRessource]
    list_display = ['date', 'section', 'amount']
    list_editable = ['amount']
    list_filter = ['section']
    date_hierarchy: Optional[str] = 'date'


@admin.register(SignaturePackage)
class SignaturePackageAdmin(ImportExportModelAdmin):
    resource_classes = [PackageRessource]
    list_display = ['date', 'section', 'amount']
    list_editable = ['amount']
    list_filter = ['section']
    date_hierarchy: Optional[str] = 'date'
