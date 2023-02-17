import json
from typing import Dict

from django.contrib.auth.models import User
from django.core.paginator import Paginator
from django.forms.models import model_to_dict
from django.http import JsonResponse
from django.shortcuts import (
    HttpResponse,
    render,
)

from app.forms import User_form


def index(request):
    return render(request, "index.html")


def user_lists(request, page):
    fields = ["id", "username", "first_name", "last_name", "email"]
    user_lists = User.objects.order_by("id").values(*fields)
    per_page = 2
    paginator = Paginator(user_lists, per_page)

    try:
        page_obj = paginator.page(page)
    except Exception as e:
        page = paginator.num_pages
        page_obj = paginator.page(page)

    records = list(page_obj)
    for index, row in enumerate(records):
        records[index]["index"] = (index + 1) + (per_page * (page - 1))

    data = {
        "records": records,
        "pagination": {
            "page_ranges": list(paginator.page_range),
            "current": page,
            "has_previous": page_obj.has_previous(),
            "has_next": page_obj.has_next(),
        },
    }
    return JsonResponse(data)


def build_user_info(user: User):
    data = model_to_dict(user, ["id", "username", "first_name", "last_name", "email"])
    return JsonResponse(data)


def get_postdata(request) -> Dict:
    postdata = json.loads(request.body.decode("utf-8"))
    return postdata


def submit_get(request):
    try:
        postdata = get_postdata(request)
        instance = User.objects.get(id=postdata.get("id"))
    except Exception as e:
        return HttpResponse("User does not exist.", status=400)

    return build_user_info(instance)


def submit_post(request):
    postdata = get_postdata(request)

    form = User_form(postdata)

    if form.is_valid():
        instance = form.save()
    else:
        return HttpResponse(beautify_form_errors(form.errors), status=400)

    return build_user_info(instance)


def submit_put(request):
    try:
        postdata = get_postdata(request)
        instance = User.objects.get(id=postdata.get("id"))
    except Exception as e:
        return HttpResponse("User does not exist.", status=400)

    form = User_form(postdata, instance=instance)

    if form.is_valid():
        instance = form.save()
    else:
        return HttpResponse(beautify_form_errors(form.errors), status=400)

    return build_user_info(instance)


def submit_delete(request):
    try:
        postdata = get_postdata(request)
        instance = User.objects.get(id=postdata.get("id"))
    except Exception as e:
        return HttpResponse("User does not exist.", status=400)

    instance.delete()
    return HttpResponse("User successfully deleted.")


def beautify_form_errors(errors):
    err_msg = ""
    errs = json.loads(errors.as_json())
    for i in errs:
        err_msg = f'{err_msg}\n{i}: {errs[i][0]["message"]} '

    return err_msg
