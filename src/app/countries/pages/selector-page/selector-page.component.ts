import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interface';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: ``,
})
export class SelectorPageComponent implements OnInit {
  public formAtlas = this.formBuilder.group({
    region: ['', [Validators.required]],
    country: ['', [Validators.required]],
    border: ['', [Validators.required]],
  });

  public countriesByRegion: SmallCountry[] = [];

  public bordersByCountry: SmallCountry[] = [];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly countriesService: CountriesService
  ) {}
  ngOnInit(): void {
    this.onChangeRegion();
    this.onChangeCountry();
  }

  public get regions(): Region[] {
    return this.countriesService.regions;
  }

  public onSubmit(): void {
    console.log(this.formAtlas.value);
  }

  public onChangeRegion(): void {
    this.formAtlas
      .get('region')!
      .valueChanges.pipe(
        tap(() => this.formAtlas.get('country')!.setValue('')),
        tap(() => (this.bordersByCountry = [])),
        filter((region) => !!region),
        switchMap((region) =>
          this.countriesService.getCountriesByRegion(region as Region)
        )
      )
      .subscribe((countries) => {
        this.countriesByRegion = countries;
      });
  }

  public onChangeCountry(): void {
    this.formAtlas
      .get('country')!
      .valueChanges.pipe(
        tap(() => this.formAtlas.get('border')!.setValue('')),
        filter((cca3) => !!cca3),
        switchMap((cca3) =>
          this.countriesService.getCountryByCca3(cca3 as string)
        ),
        switchMap((country) =>
          this.countriesService.getCountryBordersByCodes(country.borders)
        )
      )
      .subscribe((countries) => (this.bordersByCountry = countries));
  }
}
