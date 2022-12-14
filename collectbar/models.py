from django.db import models

# Create your models here.


class Section(models.Model):
    name = models.CharField(max_length=200)

    def __str__(self) -> str:
        return self.name

    class Meta:
        ordering = ['name']


class Goal(models.Model):
    section = models.ForeignKey(Section, models.CASCADE)
    amount = models.PositiveIntegerField()
    date = models.DateField()

    def __str__(self) -> str:
        return f'Goal: {self.section}: {self.amount}, {self.date}'

    class Meta:
        ordering = ['date']


class SignaturePackage(models.Model):
    section = models.ForeignKey(Section, models.CASCADE)
    date = models.DateField()
    amount = models.PositiveIntegerField()

    class Meta:
        ordering = ['date']

    def __str__(self) -> str:
        return f'Package: {self.section}: {self.amount}, {self.date}'
