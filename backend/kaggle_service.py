from kaggle.api.kaggle_api_extended import KaggleApi

_api = KaggleApi()
_api.authenticate()

def search_kaggle(query: str, limit=20):
    results = _api.dataset_list(search=query)

    datasets = []
    for d in results[:limit]:
        datasets.append(
            {
                "name": d.title,
                "ref": d.ref,
                "size": d.total_bytes or 0,
                "downloads": d.download_count or 0,
                "votes": d.vote_count or 0,
                "kaggle_usability": d.usability_rating,
                
                "subtitle": d.subtitle,
                "description": d.description,
                # "gist": d.gist
            }

        )
    # print(datasets[0])
    return datasets
