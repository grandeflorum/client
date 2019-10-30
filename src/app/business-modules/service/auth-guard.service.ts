import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuardService implements CanActivate {
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {

        //return this.checkLogin(state);
        return true;
    }

    constructor(
        private router: Router
    ) { }


    checkLogin(state): Promise<boolean> {
        var url = state.url;
        var result;



        return result;
    }
}
