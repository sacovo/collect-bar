from django.http.response import JsonResponse
from django.shortcuts import render

from collectbar.models import Goal, Section, SignaturePackage


def get_goals(request):
    goals = list(Goal.objects.all().values())
    return JsonResponse(goals, safe=False)


def get_packages(request):
    packages = list(SignaturePackage.objects.all().values())
    return JsonResponse(packages, safe=False)


def get_sections(request):
    sections = list(Section.objects.all().values())
    return JsonResponse(sections, safe=False)


def overview(request):
    return render(request, 'collectbar/overview.html')
