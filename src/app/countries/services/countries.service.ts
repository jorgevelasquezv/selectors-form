import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest, map } from 'rxjs';

import { Country, Region, SmallCountry } from '../interfaces/country.interface';

@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  private urlApi = 'https://restcountries.com/v3.1';

  private _regions = [
    Region.Africa,
    Region.Americas,
    Region.Asia,
    Region.Europe,
    Region.Oceania,
  ];
  constructor(private readonly http: HttpClient) {}

  public get regions(): Region[] {
    return [...this._regions];
  }

  public getCountriesByRegion(region: Region): Observable<SmallCountry[]> {
    if (!region) {
      return new Observable<SmallCountry[]>();
    }
    const url = `${this.urlApi}/region/${region}?fields=cca3,name,borders,flags`;
    return this.http
      .get<Country[]>(url)
      .pipe(map((countries) => countries.map(this.mapCountryToSmallCountry)));
  }

  public getCountryByCca3(cca3: string): Observable<SmallCountry> {
    if (!cca3) {
      return new Observable<SmallCountry>();
    }
    const url = `${this.urlApi}/alpha/${cca3}?fields=cca3,name,borders,flags`;
    return this.http.get<Country>(url).pipe(map(this.mapCountryToSmallCountry));
  }

  public getCountryBordersByCodes(
    bordersCode: string[]
  ): Observable<SmallCountry[]> {
    if (!bordersCode || bordersCode.length === 0) {
      return new Observable<SmallCountry[]>();
    }
    const countriesRequest: Observable<SmallCountry>[] = bordersCode.map(
      (code) => this.getCountryByCca3(code)
    );
    return combineLatest(countriesRequest);
  }

  private mapCountryToSmallCountry(country: Country): SmallCountry {
    return {
      name: country.name.common,
      cca3: country.cca3,
      flags: country.flags,
      borders: country.borders ?? [],
    };
  }
}
